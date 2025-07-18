// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'completed', 'canceled'],
    default: 'pending',
  },
  paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Online'],
      required: true,
    },

  // ✅ NEW FIELDS
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway'],
    required: true,
  },
  tableNumber: { type: String }, // Only for dine-in
  pickupTime: { type: String },  // Only for takeaway

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
