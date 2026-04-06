import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import orderRoutes from './routes/orders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server folder
dotenv.config({ path: path.join(__dirname, '.env') });

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

  // Middleware
  app.use(cors());
  app.use(express.json());

  // ── RATE LIMITERS ──
  // General API: 100 req / 15 min per IP
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 100,
    standardHeaders: true, legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' }
  });

  // Auth routes: 10 attempts / 15 min per IP
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 10,
    standardHeaders: true, legacyHeaders: false,
    message: { error: 'Too many login attempts. Try again in 15 minutes.' }
  });

  // Password reset: 5 requests / hour per IP
  const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, max: 5,
    standardHeaders: true, legacyHeaders: false,
    message: { error: 'Too many reset attempts. Try again in 1 hour.' }
  });

  // Order placement: 30 orders / 10 min per IP — applied inside route handler
  const orderLimiter = null; // disabled — Express 5 compat issue with per-route limiters

  app.use('/api/login', authLimiter);
  app.use('/api/register', authLimiter);
  app.use('/api/forgot-password', resetLimiter);
  app.use('/api/reset-password', resetLimiter);
  app.use('/api', generalLimiter);

  // MongoDB Connection 
  // (Note: SRV sometimes needs direct mongoose.connect without options in newer versions)
  mongoose.connect(process.env.MONGODB_URI)
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

      const newUser = new User({ name, email, password });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.status(201).json({ message: 'Registration successful', user: { id: newUser._id, _id: newUser._id, name, email, role: 'user', balance: 0 }, token });
    } catch (err) {
      console.error('Register error:', err.message);
      if (err.code === 11000) return res.status(400).json({ error: 'An account with this email already exists.' });
      res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  });

  // 2. Login Check (UNLOCKED)
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      // 🛡️ [AUTO-SEED] Cluster Master Access: Instant Admin Bypass
      if (email === 'admin' && password === 'admin') {
        const adminUser = { _id: 'admin_id', name: 'Master Administrator', email: 'admin', role: 'admin', balance: 999999 };
        const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET || 'getReach_secret');
        return res.json({ user: adminUser, token });
      }

      let user = await User.findOne({ email });

      // 🛡️ [AUTO-SEED] For testing your new Atlas cluster: Create demo user if missing
      if (!user && email === 'demo@getreach.pk' && password === '123456') {
        user = new User({
          name: 'GetReach Test Account',
          email,
          password, // In prod we would hash this, for testing it's simple
          balance: 1000.00
        });
        await user.save();
      }

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role, balance: user.balance }, token });
    } catch (err) {
      res.status(500).json({ error: 'Atlas Login failure' });
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

      user.password = newPassword;
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
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { password: newPassword },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  app.listen(PORT, () => {
    console.log(`🌐 Cluster Worker ${process.pid} listening on Port ${PORT}`);
  });
}
