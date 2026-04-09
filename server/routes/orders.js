import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import ServiceOverride from '../models/ServiceOverride.js';
import callPakfollowersAPI from '../utils/pakfollowers.js';

const router = express.Router();

// Your profit markup — change MARKUP_MULTIPLIER in .env to adjust
// e.g. 1.5 = 50% profit on top of API cost, 2.0 = 100% (double), 1.0 = no markup
const MARKUP = parseFloat(process.env.MARKUP_MULTIPLIER || '1.0');

// Fetch API Balance
router.get('/balance', async (req, res) => {
  try {
    const data = await callPakfollowersAPI({ action: 'balance' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all services with markup applied (Cache for 10 mins, serve stale on failure)
let servicesCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

router.get('/services', async (req, res) => {
  try {
    // Serve from cache if fresh
    if (servicesCache && Date.now() - lastCacheTime < CACHE_TTL) {
      return res.json(servicesCache);
    }

    const rawData = await callPakfollowersAPI({ action: 'services' });
    const overrides = await ServiceOverride.find({ hidden: { $ne: true } });

    if (!overrides.length) {
      servicesCache = [];
      lastCacheTime = Date.now();
      return res.json([]);
    }

    const rawMap = {};
    if (Array.isArray(rawData)) rawData.forEach(s => { rawMap[String(s.service)] = s; });

    const result = overrides
      .map(ov => {
        const raw = rawMap[ov.serviceId] || {};
        const baseRate = parseFloat(raw.rate || 0) * MARKUP * 315; // PKR
        return {
          service:  ov.serviceId,
          name:     ov.name     || raw.name,
          category: ov.category || raw.category,
          rate:     ov.rate     ?? baseRate.toFixed(2),
          min:      ov.min      ?? raw.min,
          max:      ov.max      ?? raw.max,
          _apiRate: parseFloat(raw.rate || 0),
        };
      })
      .filter(s => s.name);

    servicesCache = result;
    lastCacheTime = Date.now();
    res.json(result);
  } catch (error) {
    // Serve stale cache on API failure rather than erroring
    if (servicesCache) return res.json(servicesCache);
    res.status(500).json({ error: error.message });
  }
});

// Place new order
router.post('/place-order', async (req, res) => {
  try {
    const { userId, serviceId, link, quantity } = req.body;
    
    if (!userId || !serviceId || !link || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Use cached services (which have markup applied)
    const services = servicesCache || await callPakfollowersAPI({ action: 'services' });
    const service = Array.isArray(services)
      ? services.find(s => String(s.service) === String(serviceId))
      : null;
    
    if (!service) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    // Use the marked-up rate to charge the user
    // service.rate is stored as USD/1k in overrides, but admin may set it as PKR/1k
    // We treat service.rate as PKR/1k (since frontend shows Rs and admin sets Rs rates)
    const ratePerUnit = parseFloat(service.rate) / 1000;  // PKR per unit
    const apiRateUSD = service._apiRate || 0;
    const apiCost = (apiRateUSD / 1000) * quantity;        // USD cost to API

    const chargeToUser = ratePerUnit * quantity;           // PKR charged to user
    const yourProfit = chargeToUser - (apiCost * 315);     // PKR profit

    if (user.balance < chargeToUser) {
      return res.status(400).json({ error: 'Insufficient internal balance' });
    }

    // Call SMM Provider with original API price (pakfollowers handles their own billing)
    const apiRes = await callPakfollowersAPI({
      action: 'add',
      service: serviceId,
      link,
      quantity
    });

    if (apiRes.error) {
      return res.status(400).json({ error: `API Error: ${apiRes.error}` });
    }

    // Deduct marked-up price from user balance
    user.balance -= chargeToUser;
    await user.save();

    // Save order with both prices for your records
    const newOrder = await Order.create({
      userId,
      serviceId,
      serviceName: service.name,
      link,
      quantity,
      price: chargeToUser,      // What you charged the user
      apiCost: apiCost,         // What the API cost you
      apiOrderId: apiRes.order,
      status: 'pending'
    });

    res.json({ success: true, order: newOrder, newBalance: user.balance });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check order status
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Local order not found' });
    if (!order.apiOrderId) return res.status(400).json({ error: 'Local order has no upstream reference API ID' });

    const apiRes = await callPakfollowersAPI({
      action: 'status',
      order: order.apiOrderId
    });

    if (apiRes.error) {
      return res.status(400).json({ error: `API Error: ${apiRes.error}` });
    }
    
    // Update local order if changed
    if (apiRes.status && apiRes.status !== order.status) {
       order.status = apiRes.status.toLowerCase();
       await order.save();
    }

    res.json({ success: true, apiStatus: apiRes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch ALL orders (admin) — must be before /user/:userId
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ created: -1 }).limit(100).populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all orders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ created: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel an order (user-initiated)
router.post('/cancel/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const terminal = ['completed', 'partial', 'cancelled', 'refunded'];
    if (terminal.includes((order.status || '').toLowerCase())) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage.' });
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Background status sync — runs every 2 minutes ──
const TERMINAL = ['completed', 'partial', 'cancelled', 'refunded'];

const syncOrderStatuses = async () => {
  try {
    const activeOrders = await Order.find({
      apiOrderId: { $exists: true, $ne: null },
      status: { $nin: TERMINAL }
    }).limit(50);

    if (activeOrders.length === 0) return;

    // Batch status check
    const ids = activeOrders.map(o => o.apiOrderId).join(',');
    const apiRes = await callPakfollowersAPI({ action: 'status', order: ids });

    // apiRes can be a single object or a map of { orderId: { status, ... } }
    const updates = Array.isArray(activeOrders) ? activeOrders : [];
    for (const order of updates) {
      try {
        let newStatus = null;
        if (apiRes && typeof apiRes === 'object') {
          const entry = apiRes[order.apiOrderId] || apiRes;
          newStatus = entry?.status?.toLowerCase();
        }
        if (newStatus && newStatus !== order.status.toLowerCase()) {
          order.status = newStatus;
          order.updatedAt = new Date();
          await order.save();
        }
      } catch {}
    }
  } catch (err) {
    // silent — don't crash the server
  }
};

setInterval(syncOrderStatuses, 2 * 60 * 1000);

// ── Admin: get all services with overrides merged (no cache bypass needed) ──
router.get('/admin/services', async (req, res) => {
  try {
    const rawData = await callPakfollowersAPI({ action: 'services' });
    const overrides = await ServiceOverride.find();
    const overrideMap = {};
    overrides.forEach(o => { overrideMap[o.serviceId] = o; });

    const merged = Array.isArray(rawData)
      ? rawData.map(s => {
          const ov = overrideMap[String(s.service)] || {};
          const PKR = 315;
          return {
            ...s,
            // raw API values (always original) — converted to PKR
            _rawName:     s.name,
            _rawCategory: s.category,
            _rawRate:     (parseFloat(s.rate) * MARKUP * PKR).toFixed(2),
            _rawMin:      s.min,
            _rawMax:      s.max,
            _apiRate:     parseFloat(s.rate),
            // effective values (override wins)
            name:         ov.name     ?? s.name,
            category:     ov.category ?? s.category,
            displayRate:  ov.rate     ?? (parseFloat(s.rate) * MARKUP * PKR).toFixed(2),
            min:          ov.min      ?? s.min,
            max:          ov.max      ?? s.max,
            hidden:       ov.hidden   ?? false,
            _hasOverride: !!overrideMap[String(s.service)],
          };
        })
      : rawData;

    res.json(merged);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Admin: save / update override for a single service ──
router.put('/admin/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, category, rate, min, max, hidden } = req.body;

    const update = { updatedAt: new Date() };
    if (name     !== undefined) update.name     = name;
    if (category !== undefined) update.category = category;
    if (rate     !== undefined) update.rate     = rate;
    if (min      !== undefined) update.min      = min;
    if (max      !== undefined) update.max      = max;
    if (hidden   !== undefined) update.hidden   = hidden;

    const doc = await ServiceOverride.findOneAndUpdate(
      { serviceId },
      { $set: update },
      { upsert: true, new: true }
    );
    // Bust the public services cache so clients see changes immediately
    servicesCache = null;
    res.json({ success: true, override: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Admin: delete override (revert to raw API data) ──
router.delete('/admin/services/:serviceId', async (req, res) => {
  try {
    await ServiceOverride.findOneAndDelete({ serviceId: req.params.serviceId });
    servicesCache = null;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
