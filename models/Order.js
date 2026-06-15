const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  discountCode: {
    type: String,
    default: ''
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    phone: String
  },
  trackingHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now },
      note: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);