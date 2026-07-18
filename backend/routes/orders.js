const express = require('express');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const auth = require('./middleware');
const router = express.Router();

const generateOrderNumber = () => 'GIGO-PH-' + Date.now().toString(36).toUpperCase();

// Get all orders (admin)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'name email phone').sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my orders (customer)
router.get('/my', auth(['customer']), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Place order (customer)
router.post('/', auth(['customer']), async (req, res) => {
  try {
    const { items, deliveryAddress, notes, customerPhone } = req.body;
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) return res.status(404).json({ message: `Medicine not found` });
      if (medicine.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
      orderItems.push({ medicine: medicine._id, name: medicine.name, price: medicine.price, quantity: item.quantity });
      totalAmount += medicine.price * item.quantity;
      medicine.stock -= item.quantity;
      await medicine.save();
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: req.user.id,
      customerName: req.body.customerName,
      customerPhone,
      deliveryAddress,
      items: orderItems,
      totalAmount,
      notes,
      statusHistory: [{ status: 'PENDING' }],
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (admin)
router.patch('/:id/status', auth(['admin']), async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    order.statusHistory.push({ status, note });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats (admin)
router.get('/stats/summary', auth(['admin']), async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'PENDING' });
    const delivered = await Order.countDocuments({ status: 'DELIVERED' });
    const revenue = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({ total, pending, delivered, revenue: revenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

