const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/media', require('./routes/media'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => res.json({ message: 'GIGO Pharmacy API 💊' }));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch(err => console.error(err));

