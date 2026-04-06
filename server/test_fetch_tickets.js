import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const Ticket = mongoose.model('Ticket', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String, message: String, status: String, created: Date
}));

const User = mongoose.model('User', new mongoose.Schema({
  name: String, email: String
}));

try {
  const tickets = await Ticket.find().populate('userId', 'name email').sort({ created: -1 });
  console.log(`Found ${tickets.length} ticket(s):`);
  tickets.forEach(t => console.log(` - [${t.status}] ${t.subject} | User: ${t.userId?.name}`));
} catch (err) {
  console.error('Error:', err.message);
}

await mongoose.disconnect();
