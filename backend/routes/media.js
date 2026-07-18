const express = require('express');
const auth = require('./middleware');
const { createUploadSignature } = require('../config/cloudinary');
const router = express.Router();

// POST /api/media/sign  (admin) — short-lived signature for a direct-to-Cloudinary upload
router.post('/sign', auth(['admin']), (req, res) => {
  try {
    const signature = createUploadSignature('gigo-pharmacy-medicines');
    res.json(signature);
  } catch (err) {
    console.error('Cloudinary signature error:', err);
    res.status(500).json({ message: 'Cloudinary is not configured on the server' });
  }
});

module.exports = router;
