const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');

// Load environment variables
dotenv.config();
const altEnv = path.join(__dirname, 'src', '.env');
if (fs.existsSync(altEnv)) {
  dotenv.config({ path: altEnv, override: true });
  console.log(`[dotenv] loaded env from ${altEnv}`);
}

const app = express();

// Simple request logger to help debug missing routes
app.use((req, res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});

// Danh sách các front-end được phép
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

// Middleware CORS duy nhất
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('✗ MONGODB_URI is not defined. Create a `.env` with `MONGODB_URI` or set the environment variable.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✓ Kết nối MongoDB thành công');
  })
  .catch((error) => {
    console.error('✗ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  });

// Authentication Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
//Fetch all revent routes
app.use('/api/events', eventRoutes);
console.log("Router event oke");

// Routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Fetch all revent routes
app.use('/api/events', eventRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'API Server đang chạy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi server'
  });
});

// 404 handler - include requested path for easier debugging
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route không tìm thấy: ${req.method} ${req.originalUrl}`
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server đang chạy tại http://localhost:${PORT}`);
});
