const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'gigo_pharmacy_secret', { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, address });
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed
router.post('/seed', async (req, res) => {
  try {
    await User.deleteMany({ email: { $in: ['admin@gigo.com', 'customer@gigo.com'] } });
    await User.create([
      { name: 'Admin', email: 'admin@gigo.com', password: 'admin123', role: 'admin' },
      { name: 'John Doe', email: 'customer@gigo.com', password: 'customer123', role: 'customer', phone: '+250788000001', address: 'KG 11 Ave, Kigali' },
    ]);
    res.json({ message: 'Users seeded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

