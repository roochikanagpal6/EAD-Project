// server.js
// ===================================
// MAIN ENTRY POINT OF THE BACKEND
// Run: node server.js  OR  npm run dev
// ===================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ---- MIDDLEWARE ----
// Allow requests from React frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// ---- ROUTES ----
// Each route file handles a different feature
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ---- TEST ROUTE ----
app.get('/', (req, res) => {
  res.json({ message: '🏥 Doctor Appointment API is running!' });
});

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
