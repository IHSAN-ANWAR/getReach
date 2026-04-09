import mongoose from 'mongoose';

// Stores admin-edited overrides for API services.
// Only fields the admin changed are stored — unset fields fall back to API data.
const serviceOverrideSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true }, // matches s.service from API
  name:      { type: String },
  category:  { type: String },
  rate:      { type: String },   // marked-up rate override (USD string)
  min:       { type: Number },
  max:       { type: Number },
  hidden:    { type: Boolean, default: false }, // hide from frontend
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ServiceOverride', serviceOverrideSchema);
