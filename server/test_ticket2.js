import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'Open' },
  created: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', ticketSchema);

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

try {
  const t = new Ticket({ userId: new mongoose.Types.ObjectId(), subject: 'Test', message: 'Hello' });
  await t.save();
  console.log('Ticket saved:', t._id);
} catch (err) {
  console.error('Save error:', err.message);
}

await mongoose.disconnect();
