const express = require('express');
const Medicine = require('../models/Medicine');
const auth = require('./middleware');
const router = express.Router();

// Get all medicines (public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const medicines = await Medicine.find(query).sort('name');
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single medicine
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create medicine (admin)
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update medicine (admin)
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete medicine (admin)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed medicines
router.post('/seed/data', async (req, res) => {
  try {
    await Medicine.deleteMany({});
    await Medicine.create([
      { name: 'Paracetamol 500mg', category: 'Pain Relief', description: 'Effective pain and fever relief', price: 500, stock: 200, unit: 'tablet', requiresPrescription: false, manufacturer: 'PharmaCo' },
      { name: 'Amoxicillin 250mg', category: 'Antibiotics', description: 'Broad spectrum antibiotic', price: 1200, stock: 80, unit: 'capsule', requiresPrescription: true, manufacturer: 'MedLab' },
      { name: 'Ibuprofen 400mg', category: 'Pain Relief', description: 'Anti-inflammatory pain relief', price: 700, stock: 150, unit: 'tablet', requiresPrescription: false, manufacturer: 'PharmaCo' },
      { name: 'Vitamin C 1000mg', category: 'Vitamins', description: 'Immune system support', price: 900, stock: 300, unit: 'tablet', requiresPrescription: false, manufacturer: 'VitaPlus' },
      { name: 'Metformin 500mg', category: 'Diabetes', description: 'Blood sugar control', price: 800, stock: 120, unit: 'tablet', requiresPrescription: true, manufacturer: 'DiabCare' },
      { name: 'Omeprazole 20mg', category: 'Digestive', description: 'Acid reflux treatment', price: 1100, stock: 90, unit: 'capsule', requiresPrescription: false, manufacturer: 'GastroCo' },
      { name: 'Cetirizine 10mg', category: 'Allergy', description: 'Antihistamine for allergies', price: 600, stock: 180, unit: 'tablet', requiresPrescription: false, manufacturer: 'AllerFree' },
      { name: 'Multivitamin Daily', category: 'Vitamins', description: 'Complete daily nutrition', price: 1500, stock: 250, unit: 'tablet', requiresPrescription: false, manufacturer: 'VitaPlus' },
    ]);
    res.json({ message: 'Medicines seeded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

