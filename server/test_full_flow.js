import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

const User = mongoose.model('User', new mongoose.Schema({
  name: String, email: String, password: String, role: String, balance: Number, created: Date
}));

const Ticket = mongoose.model('Ticket', new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject:    String,
  message:    String,
  status:     { type: String, default: 'Open' },
  adminReply: { type: String, default: '' },
  repliedAt:  Date,
  created:    { type: Date, default: Date.now }
}));

// Step 1: Find a real user
const user = await User.findOne({ role: { $ne: 'system' } });
if (!user) { console.error('No user found in DB'); process.exit(1); }
console.log(`👤 User found: ${user.name} (${user.email})`);

// Step 2: Create a ticket as that user
const ticket = await Ticket.create({
  userId:  user._id,
  subject: '[Order] My order #1055 is delayed',
  message: 'Hi, I placed an order 3 days ago and it still shows pending. Please help me resolve this issue as soon as possible.',
  status:  'Open'
});
console.log(`🎫 Ticket created: #${ticket._id.toString().slice(-5).toUpperCase()}`);
console.log(`   Subject: ${ticket.subject}`);
console.log(`   Message: ${ticket.message}\n`);

// Step 3: Admin replies and resolves
const replied = await Ticket.findByIdAndUpdate(ticket._id, {
  adminReply: 'Hi! We have checked your order #1055. It has been dispatched and will be delivered within 24 hours. Sorry for the delay!',
  repliedAt:  new Date(),
  status:     'Resolved'
}, { new: true });

console.log(`💬 Admin replied:`);
console.log(`   Reply: ${replied.adminReply}`);
console.log(`   Status: ${replied.status}\n`);

// Step 4: Fetch as user would (by userId)
const userTickets = await Ticket.find({ userId: user._id }).populate('userId', 'name email');
console.log(`📋 User's tickets (${userTickets.length} total):`);
userTickets.forEach(t => {
  console.log(`\n   🎫 #${t._id.toString().slice(-5).toUpperCase()} — ${t.subject}`);
  console.log(`   Status: ${t.status}`);
  console.log(`   Message: ${t.message}`);
  if (t.adminReply) console.log(`   ✅ Admin Reply: ${t.adminReply}`);
  else console.log(`   ⏳ No reply yet`);
});

await mongoose.disconnect();
console.log('\n✅ Full flow test complete. Restart server and check the UI.');
