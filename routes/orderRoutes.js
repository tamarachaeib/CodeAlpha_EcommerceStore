const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress, discountCode, discountAmount } = req.body;

    // Reduce stock for each item
   for (const item of items) {
      const cleanId = item.product.toString().slice(0, 24);
      const product = await Product.findById(cleanId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // Use coupon
    if (discountCode) {
      const coupon = await Coupon.findOne({ code: discountCode.toUpperCase() });
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const cleanItems = items.map(item => ({
      ...item,
      product: item.product.toString().slice(0, 24)
    }));

    const order = await Order.create({
      user: req.user.id,
      items: cleanItems,
      totalPrice,
      discountCode: discountCode || '',
      discountAmount: discountAmount || 0,
      shippingAddress,
      trackingHistory: [{ status: 'pending', note: 'Order placed successfully' }]
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.trackingHistory.push({
      status,
      note: getStatusNote(status),
      date: new Date()
    });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function getStatusNote(status) {
  const notes = {
    pending: 'Order placed successfully',
    processing: 'Order is being processed',
    shipped: 'Order has been shipped',
    delivered: 'Order delivered successfully',
    cancelled: 'Order has been cancelled'
  };
  return notes[status] || status;
}

module.exports = router;