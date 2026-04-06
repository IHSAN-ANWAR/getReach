import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String },
  link: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number },
  apiOrderId: { type: String },
  status: { type: String, default: 'pending' },
  created: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
