/**
 * GetReach — Realistic 1K Concurrent User Load Test
 *
 * Simulates real users navigating the app:
 *   70% → browse services → view their orders (regular users)
 *   20% → login → place order flow
 *   10% → submit / check support ticket
 *
 * Run:  k6 run k6_load_test.js
 * Prod: k6 run -e BASE_URL=https://your-domain.com k6_load_test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Custom Metrics ──
const errorRate   = new Rate('errors');
const loginDur    = new Trend('login_duration',    true);
const servicesDur = new Trend('services_duration', true);
const ordersDur   = new Trend('orders_duration',   true);
const ticketDur   = new Trend('ticket_duration',   true);
const totalReqs   = new Counter('total_requests');

export const options = {
  scenarios: {
    // Ramp to 1000 real users within 15s, hold, then ramp down
    real_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s',  target: 1000 }, // ramp up
        { duration: '7s',  target: 1000 }, // hold at 1k
        { duration: '5s',  target: 0    }, // ramp down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_duration:  ['p(95)<2000', 'p(99)<5000'],
    http_req_failed:    ['rate<0.05'],
    errors:             ['rate<0.05'],
    login_duration:     ['p(95)<3000'],
    services_duration:  ['p(95)<800'],   // should be cached
    orders_duration:    ['p(95)<2000'],
    ticket_duration:    ['p(95)<2000'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:5000';
const JSON_H = { headers: { 'Content-Type': 'application/json' } };

// ── Shared login helper ──
function doLogin(email, password) {
  const res = http.post(
    `${BASE}/api/login`,
    JSON.stringify({ email, password }),
    JSON_H
  );
  loginDur.add(res.timings.duration);
  totalReqs.add(1);

  const ok = check(res, {
    'login 200':       (r) => r.status === 200,
    'login has token': (r) => { try { return !!JSON.parse(r.body).token; } catch { return false; } },
  });
  errorRate.add(!ok);

  if (res.status === 200) {
    try {
      const b = JSON.parse(res.body);
      return { token: b.token, userId: b.user?._id || b.user?.id };
    } catch (_) {}
  }
  return null;
}

// ─────────────────────────────────────────────
// SCENARIO A (70% of VUs) — Browse & View Orders
// Simulates: user opens app → sees services → checks their orders
// ─────────────────────────────────────────────
function scenarioBrowse() {
  group('browse_services', () => {
    const res = http.get(`${BASE}/api/orders/services`);
    servicesDur.add(res.timings.duration);
    totalReqs.add(1);
    const ok = check(res, { 'services 200': (r) => r.status === 200 });
    errorRate.add(!ok);
  });

  sleep(0.3); // user reads the page

  group('login_and_view_orders', () => {
    const session = doLogin('demo@getreach.pk', '123456');
    if (!session) return;

    sleep(0.2);

    const res = http.get(
      `${BASE}/api/orders/user/${session.userId}`,
      { headers: { Authorization: `Bearer ${session.token}` } }
    );
    ordersDur.add(res.timings.duration);
    totalReqs.add(1);
    check(res, { 'orders 200': (r) => r.status === 200 });
  });
}

// ─────────────────────────────────────────────
// SCENARIO B (20% of VUs) — Full Order Placement
// Simulates: login → browse → place order → check balance
// ─────────────────────────────────────────────
function scenarioPlaceOrder() {
  group('place_order_flow', () => {
    // Step 1: login
    const session = doLogin('demo@getreach.pk', '123456');
    if (!session) return;

    sleep(0.2);

    // Step 2: fetch services to pick one
    const svcRes = http.get(`${BASE}/api/orders/services`);
    servicesDur.add(svcRes.timings.duration);
    totalReqs.add(1);
    if (svcRes.status !== 200) return;

    let serviceId = null;
    try {
      const services = JSON.parse(svcRes.body);
      if (Array.isArray(services) && services.length > 0) {
        // Pick a random service from the list
        serviceId = services[Math.floor(Math.random() * Math.min(services.length, 10))].service;
      }
    } catch (_) {}

    sleep(0.3); // user picks a service

    // Step 3: place order (will likely fail with insufficient balance — that's fine, we're testing load)
    if (serviceId) {
      const orderRes = http.post(
        `${BASE}/api/orders/place-order`,
        JSON.stringify({
          userId:    session.userId,
          serviceId: String(serviceId),
          link:      'https://instagram.com/testuser',
          quantity:  100,
        }),
        {
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session.token}`,
          }
        }
      );
      totalReqs.add(1);
      // 200 = success, 400 = insufficient balance (expected for demo user) — both are valid responses
      check(orderRes, {
        'order responded': (r) => r.status === 200 || r.status === 400,
      });
    }

    sleep(0.2);

    // Step 4: view their orders after placing
    const ordersRes = http.get(
      `${BASE}/api/orders/user/${session.userId}`,
      { headers: { Authorization: `Bearer ${session.token}` } }
    );
    ordersDur.add(ordersRes.timings.duration);
    totalReqs.add(1);
    check(ordersRes, { 'orders after place 200': (r) => r.status === 200 });
  });
}

// ─────────────────────────────────────────────
// SCENARIO C (10% of VUs) — Support Ticket
// Simulates: login → submit ticket → check tickets
// ─────────────────────────────────────────────
function scenarioTicket() {
  group('support_ticket_flow', () => {
    const session = doLogin('demo@getreach.pk', '123456');
    if (!session) return;

    sleep(0.2);

    // Submit a ticket
    const ticketRes = http.post(
      `${BASE}/api/tickets`,
      JSON.stringify({
        userId:  session.userId,
        subject: `Load test ticket from VU ${__VU}`,
        message: 'This is an automated load test message. Please ignore.',
      }),
      JSON_H
    );
    ticketDur.add(ticketRes.timings.duration);
    totalReqs.add(1);
    check(ticketRes, { 'ticket created 201': (r) => r.status === 201 });

    sleep(0.2);

    // Fetch their tickets
    const fetchRes = http.get(`${BASE}/api/tickets?userId=${session.userId}`);
    ticketDur.add(fetchRes.timings.duration);
    totalReqs.add(1);
    check(fetchRes, { 'tickets fetched 200': (r) => r.status === 200 });
  });
}

// ─────────────────────────────────────────────
// MAIN — route each VU to a scenario by VU number
// ─────────────────────────────────────────────
export default function () {
  const roll = __VU % 10; // 0-9

  if (roll <= 6) {
    // 70% — browse + view orders
    scenarioBrowse();
  } else if (roll <= 8) {
    // 20% — full order placement
    scenarioPlaceOrder();
  } else {
    // 10% — support ticket
    scenarioTicket();
  }

  sleep(0.1);
}

// ─────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────
export function handleSummary(data) {
  const m   = data.metrics;
  const get = (key, stat) => m[key]?.values?.[stat] ?? 0;

  const reqs     = get('http_reqs',        'count');
  const rps      = get('http_reqs',        'rate').toFixed(1);
  const p95      = get('http_req_duration','p(95)').toFixed(0);
  const p99      = get('http_req_duration','p(99)').toFixed(0);
  const errPct   = (get('errors',          'rate') * 100).toFixed(2);
  const failPct  = (get('http_req_failed', 'rate') * 100).toFixed(2);
  const loginP95 = get('login_duration',   'p(95)').toFixed(0);
  const svcP95   = get('services_duration','p(95)').toFixed(0);
  const ordP95   = get('orders_duration',  'p(95)').toFixed(0);
  const tktP95   = get('ticket_duration',  'p(95)').toFixed(0);

  const allPassed = Object.values(m)
    .filter(v => v.thresholds)
    .flatMap(v => Object.values(v.thresholds))
    .every(t => t.ok);

  const box = `
╔══════════════════════════════════════════════════════╗
║       GetReach — 1K Concurrent Users Load Test       ║
╠══════════════════════════════════════════════════════╣
║  Total Requests    : ${String(reqs).padEnd(30)}║
║  Throughput (rps)  : ${String(rps).padEnd(30)}║
╠══════════════════════════════════════════════════════╣
║  Overall p(95)     : ${String(p95 + 'ms').padEnd(30)}║
║  Overall p(99)     : ${String(p99 + 'ms').padEnd(30)}║
║  Login p(95)       : ${String(loginP95 + 'ms').padEnd(30)}║
║  Services p(95)    : ${String(svcP95 + 'ms').padEnd(30)}║
║  Orders p(95)      : ${String(ordP95 + 'ms').padEnd(30)}║
║  Tickets p(95)     : ${String(tktP95 + 'ms').padEnd(30)}║
╠══════════════════════════════════════════════════════╣
║  Error Rate        : ${String(errPct + '%').padEnd(30)}║
║  HTTP Fail Rate    : ${String(failPct + '%').padEnd(30)}║
╠══════════════════════════════════════════════════════╣
║  Result            : ${allPassed
    ? '✅ ALL THRESHOLDS PASSED          '
    : '❌ SOME THRESHOLDS FAILED         '}║
╚══════════════════════════════════════════════════════╝
`;

  console.log(box);
  return {
    stdout:                   box,
    'load_test_results.json': JSON.stringify(data, null, 2),
  };
}
