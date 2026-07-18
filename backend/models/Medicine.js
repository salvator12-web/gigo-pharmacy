const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'tablet' },
  requiresPrescription: { type: Boolean, default: false },
  image: { type: String }, // Cloudinary secure_url, folder: gigo-pharmacy-medicines
  manufacturer: { type: String },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
