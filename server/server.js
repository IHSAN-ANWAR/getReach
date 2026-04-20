import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import compression from 'compression';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import orderRoutes from './routes/orders.js';
import FundRequest from './models/FundRequest.js';
import callPakfollowersAPI from './utils/pakfollowers.js';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🌐 Primary Cluster ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ Worker ${worker.process.pid} died. Auto-restarting...`);
    cluster.fork();
  });

} else {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Redis client — falls back gracefully if Redis not available
  let redis = null;
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    redis.on('error', () => { redis = null; }); // disable if Redis unavailable
    await redis.connect().catch(() => { redis = null; });
    if (redis) console.log(`✅ Worker ${process.pid} - Redis Connected`);
  } catch {
    redis = null;
    console.log(`⚠️  Worker ${process.pid} - Redis unavailable, using DB only`);
  }

  // Middleware
  app.use(cors());
  app.use(compression());
  app.set('trust proxy', 1); // trust Back4App/Render proxy
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(express.json({ limit: '1mb' }));

  // ── Health check — used by Docker/nginx ──
  app.get('/health', (req, res) => res.json({ status: 'ok', pid: process.pid }));

  // ── Admin login bypass — dedicated route, no rate limiting ──
  app.post('/api/admin-auth', async (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const adminUser = { _id: 'admin_id', name: 'Master Administrator', email: process.env.ADMIN_USERNAME, role: 'admin', balance: 0 };
      const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET || 'getReach_secret');
      return res.json({ user: adminUser, token });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
  });

  // ── Brute-force protection on login ──
  const loginLimiter = (await import('express-rate-limit')).default({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/login', loginLimiter);

  // MongoDB — connection pool tuned for cluster workers
  // Pool tuned for horizontal scaling:
  // 3 containers × 4 CPUs × 20 connections = 240 total Atlas connections
  mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
  })
    .then(() => console.log(`🚀 Worker ${process.pid} - Atlas Connected`))
    .catch(err => console.error(`❌ Worker ${process.pid} Database Error:`, err.message));

  // ── USER SCHEMA ──
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    balance: { type: Number, default: 0 },
    created: { type: Date, default: Date.now },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }
  });

  const User = mongoose.model('User', userSchema);



  // ── TICKET SCHEMA ──
  const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'Open' },
    adminReply: { type: String, default: '' },
    repliedAt: { type: Date },
    // Full chat thread
    messages: [{
      sender: { type: String, enum: ['user', 'admin'], required: true },
      text: { type: String, required: true },
      sentAt: { type: Date, default: Date.now }
    }],
    created: { type: Date, default: Date.now }
  });

  const Ticket = mongoose.model('Ticket', ticketSchema);

  // ── API ROUTES ──



  // 1. Register User in Atlas (UNLOCKED)
  app.post('/api/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required.' });
      }

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.status(201).json({ message: 'Registration successful', user: { id: newUser._id, _id: newUser._id, name, email, role: 'user', balance: 0 }, token });
    } catch (err) {
      console.error('Register error:', err.message);
      if (err.code === 11000) return res.status(400).json({ error: 'An account with this email already exists.' });
      res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  });

  // 2. Login Check
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Admin bypass — credentials loaded from .env (never hardcoded)
      if (email === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const adminUser = { _id: 'admin_id', name: 'Master Administrator', email: process.env.ADMIN_USERNAME, role: 'admin', balance: 0 };
        const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET || 'getReach_secret');
        return res.json({ user: adminUser, token });
      }

      // ── Redis cache check ──
      const cacheKey = `user:${email}`;
      let user = null;

      if (redis) {
        try {
          const cached = await redis.get(cacheKey);
          if (cached) user = JSON.parse(cached);
        } catch {}
      }

      // ── DB fallback ──
      if (!user) {
        user = await User.findOne({ email }).lean();

        // Demo user auto-create
        if (!user && email === 'demo@getreach.pk' && password === '123456') {
          const hashed = await bcrypt.hash('123456', 10);
          const created = new User({ name: 'GetReach Test Account', email, password: hashed, balance: 10 });
          await created.save();
          user = created.toObject();
        }

        if (user && redis) {
          try { await redis.setex(cacheKey, 300, JSON.stringify(user)); } catch {} // cache 5 min
        }
      }

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      // ── Password check — support both hashed and legacy plain ──
      let passwordMatch = false;
      if (user.password.startsWith('$2')) {
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plain text — migrate on login
        passwordMatch = user.password === password;
        if (passwordMatch) {
          const hashed = await bcrypt.hash(password, 10);
          await User.findByIdAndUpdate(user._id, { password: hashed });
          if (redis) {
            try { await redis.del(cacheKey); } catch {} // bust cache so next login uses hashed
          }
        }
      }

      if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role, balance: user.balance }, token });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // 3. User List for Admin Panel
  app.get('/api/users', async (req, res) => {
    try {
      // Return ALL users including duplicates
      const users = await User.find().sort({ created: -1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user database' });
    }
  });

  app.use('/api/orders', orderRoutes);

  // ── FUND REQUESTS ──

  // User: submit fund request
  app.post('/api/fund-requests', async (req, res) => {
    try {
      const { userId, method, amount, tid } = req.body;
      if (!userId || !method || !amount || !tid)
        return res.status(400).json({ error: 'All fields required.' });

      // Block admin account from submitting fund requests
      const requestingUser = await User.findById(userId).lean();
      if (requestingUser?.role === 'admin')
        return res.status(403).json({ error: 'Admin accounts cannot submit fund requests.' });
      if (parseFloat(amount) < 50)
        return res.status(400).json({ error: 'Minimum deposit is Rs 50.' });
      // Check duplicate TID
      const exists = await FundRequest.findOne({ tid });
      if (exists) return res.status(400).json({ error: 'This Transaction ID has already been submitted.' });
      const req2 = await FundRequest.create({ userId, method, amount: parseFloat(amount), tid });
      res.status(201).json(req2);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // User: get own requests
  app.get('/api/fund-requests/user/:userId', async (req, res) => {
    try {
      const requests = await FundRequest.find({ userId: req.params.userId }).sort({ created: -1 });
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: get all requests
  app.get('/api/fund-requests', async (req, res) => {
    try {
      const requests = await FundRequest.find().populate('userId', 'name email balance').sort({ created: -1 });
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: approve or reject
  app.patch('/api/fund-requests/:id', async (req, res) => {
    try {
      const { status, note } = req.body;
      const fr = await FundRequest.findById(req.params.id).populate('userId');
      if (!fr) return res.status(404).json({ error: 'Request not found.' });
      if (fr.status !== 'pending') return res.status(400).json({ error: 'Already processed.' });

      fr.status = status;
      fr.note = note || '';
      fr.updatedAt = new Date();
      await fr.save();

      if (status === 'approved') {
        await User.findByIdAndUpdate(fr.userId._id, { $inc: { balance: fr.amount } });
      }

      res.json({ success: true, request: fr });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Revenue Page
  app.get('/api/admin/revenue', async (req, res) => {
    try {
      const Order = (await import('./models/Order.js')).default;
      const { period = '30' } = req.query; // days
      const days = parseInt(period) || 30;
      const since = new Date(Date.now() - days * 86400000);

      const [totals, daily, topServices] = await Promise.all([
        // Overall totals
        Order.aggregate([
          { $group: {
            _id: null,
            totalRevenue: { $sum: '$price' },
            totalApiCost: { $sum: '$apiCost' },
            totalOrders:  { $sum: 1 }
          }}
        ]),
        // Daily breakdown for chart
        Order.aggregate([
          { $match: { created: { $gte: since } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$created' } },
            revenue: { $sum: '$price' },
            apiCost: { $sum: '$apiCost' },
            orders:  { $sum: 1 }
          }},
          { $sort: { _id: 1 } }
        ]),
        // Top services by revenue
        Order.aggregate([
          { $match: { created: { $gte: since } } },
          { $group: {
            _id: '$serviceName',
            revenue: { $sum: '$price' },
            apiCost: { $sum: '$apiCost' },
            orders:  { $sum: 1 }
          }},
          { $sort: { revenue: -1 } },
          { $limit: 8 }
        ])
      ]);

      const t = totals[0] || { totalRevenue: 0, totalApiCost: 0, totalOrders: 0 };
      res.json({
        totalRevenue: t.totalRevenue,
        totalApiCost: t.totalApiCost,
        totalProfit:  t.totalRevenue - t.totalApiCost,
        totalOrders:  t.totalOrders,
        daily,
        topServices,
      });
    } catch (err) {
      console.error('Revenue error:', err.message);
      res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
  });

  // Admin Stats Dashboard
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const Order = (await import('./models/Order.js')).default;

      const [totalUsers, totalOrders, totalTickets, revenueAgg, openTickets,
             usersLast7, ordersLast7, recentUsers, recentOrders] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Ticket.countDocuments(),
        Order.aggregate([{ $group: { _id: null, total: { $sum: '$price' } } }]),
        Ticket.countDocuments({ status: { $in: ['Open', 'In Review'] } }),
        User.aggregate([
          { $match: { created: { $gte: new Date(Date.now() - 6 * 86400000) } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
          { $match: { created: { $gte: new Date(Date.now() - 6 * 86400000) } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        User.find().sort({ created: -1 }).limit(5).select('name email created'),
        Order.find().sort({ created: -1 }).limit(5).populate('userId', 'name email'),
      ]);

      res.json({
        totalUsers, totalOrders, totalTickets, openTickets,
        totalRevenue: revenueAgg[0]?.total || 0,
        usersLast7, ordersLast7, recentUsers, recentOrders,
      });
    } catch (err) {
      console.error('Stats error:', err.message);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // 5. Ticket System (User Create)
  app.post('/api/tickets', async (req, res) => {
    try {
      const { userId, subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ error: 'subject and message are required' });
      }

      let ticketData = { subject, message };

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        ticketData.userId = userId;
      } else {
        // For admin or users without valid ObjectId, use a placeholder user or skip userId
        // Find or create a system user to attach the ticket to
        let systemUser = await User.findOne({ email: 'system@getreach.pk' });
        if (!systemUser) {
          systemUser = await User.create({ name: 'System', email: 'system@getreach.pk', password: 'system' });
        }
        ticketData.userId = systemUser._id;
      }

      const newTicket = new Ticket({
        ...ticketData,
        messages: [{ sender: 'user', text: message, sentAt: new Date() }]
      });
      await newTicket.save();
      res.status(201).json(newTicket);
    } catch (err) {
      console.error('Ticket creation error:', err.message);
      res.status(500).json({ error: 'Failed to open support ticket: ' + err.message });
    }
  });

  // 6. Ticket Management (Admin Fetch - All Tickets)
  app.get('/api/tickets', async (req, res) => {
    try {
      const { userId } = req.query;
      let filter = {};
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        filter = { userId: new mongoose.Types.ObjectId(userId) };
      }
      const tickets = await Ticket.find(filter).populate('userId', 'name email').sort({ created: -1 });
      res.json(tickets);
    } catch (err) {
      console.error('Ticket fetch error:', err.message);
      res.status(500).json({ error: 'Failed to fetch global ticket queue' });
    }
  });

  // 7. Update ticket status + reply (Admin or User)
  app.patch('/api/tickets/:id', async (req, res) => {
    try {
      const { status, adminReply, userReply } = req.body;
      const update = {};
      const push = {};

      if (status) update.status = status;

      if (adminReply !== undefined && adminReply !== '') {
        update.adminReply = adminReply;
        update.repliedAt = new Date();
        if (!status) update.status = 'In Review';
        push.messages = { sender: 'admin', text: adminReply, sentAt: new Date() };
      }

      if (userReply !== undefined && userReply !== '') {
        update.status = update.status || 'Open';
        push.messages = { sender: 'user', text: userReply, sentAt: new Date() };
      }

      const ops = { $set: update };
      if (push.messages) ops.$push = { messages: push.messages };

      const ticket = await Ticket.findByIdAndUpdate(req.params.id, ops, { new: true });
      res.json(ticket);
    } catch (err) {
      console.error('Ticket update error:', err.message);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  });

  // 9. Forgot Password — send reset email
  app.post('/api/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      // Always return success to avoid email enumeration
      if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

      const token = crypto.randomBytes(32).toString('hex');
      user.resetToken = token;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      await transporter.sendMail({
        from: `"GetReach Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset Your GetReach Password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#1A2517;border-radius:16px;color:#F5F0E8;">
            <h2 style="color:#ACC8A2;margin-bottom:8px;">Password Reset</h2>
            <p style="color:rgba(245,240,232,0.7);margin-bottom:24px;">Hi ${user.name}, click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#ACC8A2;color:#1A2517;border-radius:10px;font-weight:800;text-decoration:none;font-size:16px;">Reset Password</a>
            <p style="margin-top:24px;color:rgba(245,240,232,0.35);font-size:12px;">If you didn't request this, ignore this email. Your password won't change.</p>
          </div>
        `
      });

      res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
      console.error('Forgot password error:', err.message);
      res.status(500).json({ error: 'Failed to send reset email.' });
    }
  });

  // 10. Reset Password — validate token and set new password
  app.post('/api/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'Invalid request.' });
      }
      const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
      if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired.' });

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reset password.' });
    }
  });

  // 8. Reset user password (Admin only)
  app.patch('/api/users/:id/reset-password', async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { password: hashed },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // Admin: add balance to user
  app.patch('/api/users/:id/add-balance', async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid amount required' });
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $inc: { balance: parseFloat(amount) } },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: 'User not found' });
      // Bust Redis cache
      if (redis) { try { await redis.del(`user:${user.email}`); } catch {} }
      res.json({ success: true, newBalance: user.balance });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update balance' });
    }
  });

  // ── API Balance Low Alert — checks every hour ──
  const LOW_BALANCE_THRESHOLD_USD = 0.32; // ≈ Rs 100
  let lastAlertSent = 0; // prevent spam — only alert once per 6 hours

  const checkApiBalance = async () => {
    try {
      const data = await callPakfollowersAPI({ action: 'balance' });
      const balance = parseFloat(data?.balance || 0);
      const now = Date.now();

      if (balance < LOW_BALANCE_THRESHOLD_USD && (now - lastAlertSent) > 6 * 60 * 60 * 1000) {
        const pkr = (balance * 315).toFixed(2);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
          from: `"GetReach Alert" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_USER,
          subject: '⚠️ Low API Balance Alert — GetReach',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#1A2517;border-radius:16px;color:#F5F0E8;">
              <h2 style="color:#ff6b7a;margin-bottom:8px;">⚠️ Low API Balance</h2>
              <p style="color:rgba(245,240,232,0.7);margin-bottom:24px;">
                Your PakFollowers API balance has dropped below the threshold.
              </p>
              <div style="background:rgba(255,107,122,0.1);border:1px solid rgba(255,107,122,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="font-size:32px;font-weight:900;color:#ff6b7a;">$${balance.toFixed(4)} USD</div>
                <div style="font-size:16px;color:rgba(245,240,232,0.5);margin-top:4px;">≈ Rs ${pkr} PKR</div>
              </div>
              <p style="color:rgba(245,240,232,0.6);font-size:14px;">
                Please top up your PakFollowers account immediately to avoid order failures.
              </p>
              <a href="https://pakfollowers.com" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#ACC8A2;color:#1A2517;border-radius:10px;font-weight:800;text-decoration:none;">
                Add Funds Now →
              </a>
              <p style="margin-top:24px;color:rgba(245,240,232,0.25);font-size:11px;">GetReach Auto Alert · Sent at ${new Date().toLocaleString()}</p>
            </div>
          `
        });

        lastAlertSent = now;
        console.log(`📧 Low balance alert sent — $${balance} USD`);
      }
    } catch (err) {
      console.error('Balance check error:', err.message);
    }
  };

  // Run immediately on startup, then every hour
  checkApiBalance();
  setInterval(checkApiBalance, 60 * 60 * 1000);

  // ── Keep-Alive Self-Ping — prevents Render free tier from sleeping ──
  // Render spins down after 15 min of inactivity. This pings /health every 14 min.
  // Set RENDER_SERVICE_URL in env (e.g. https://your-app.onrender.com)
  const PING_URL = process.env.RENDER_SERVICE_URL
    ? `${process.env.RENDER_SERVICE_URL}/health`
    : null;

  if (PING_URL) {
    const pingServer = async () => {
      try {
        const res = await fetch(PING_URL, { signal: AbortSignal.timeout(10000) });
        console.log(`🏓 Keep-alive ping → ${PING_URL} [${res.status}]`);
      } catch (err) {
        console.warn(`⚠️  Keep-alive ping failed: ${err.message}`);
      }
    };
    // Ping every 14 minutes (Render sleeps after 15 min of inactivity)
    setInterval(pingServer, 14 * 60 * 1000);
    console.log(`🏓 Keep-alive ping enabled → ${PING_URL} (every 14 min)`);
  }

  app.listen(PORT, () => {
    console.log(`🌐 Cluster Worker ${process.pid} listening on Port ${PORT}`);
  });
}
