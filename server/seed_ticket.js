import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected');

const Ticket = mongoose.model('Ticket', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  message: String,
  status: { type: String, default: 'Open' },
  created: { type: Date, default: Date.now }
}));

const User = mongoose.model('User', new mongoose.Schema({
  name: String, email: String, password: String, role: String, balance: Number, created: Date
}));

// grab first real user or create one
let user = await User.findOne({ role: { $ne: 'admin' } });
if (!user) {
  user = await User.create({ name: 'Test User', email: 'test@getreach.pk', password: '123456', role: 'user', balance: 0 });
  console.log('Created test user:', user.email);
}

const ticket = await Ticket.create({
  userId: user._id,
  subject: '[Order] Test Ticket - Is this working?',
  message: 'This is a seed ticket to verify the admin panel is fetching correctly.',
  status: 'Open'
});

console.log('Ticket saved to DB:', ticket._id.toString());
console.log('Subject:', ticket.subject);
console.log('User:', user.name, '/', user.email);

await mongoose.disconnect();
console.log('Done. Now check your admin panel.');
