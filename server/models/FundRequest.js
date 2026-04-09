import mongoose from 'mongoose';

const fundRequestSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method:    { type: String, required: true },
  amount:    { type: Number, required: true },
  tid:       { type: String, required: true },
  status:    { type: String, default: 'pending' },
  note:      { type: String, default: '' },
  created:   { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const FundRequest = mongoose.models.FundRequest || mongoose.model('FundRequest', fundRequestSchema);
export default FundRequest;
