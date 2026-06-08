// controllers/authController.js
// Handles: Register, Login, Get Profile

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ---- HELPER: Generate JWT Token ----
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token valid for 7 days
  });
};

// ---- HELPER: Send welcome email ----
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Doctor Appointment" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Doctor Appointment System!',
      html: `
        <h2>Hi ${name}! 👋</h2>
        <p>Welcome to our Doctor Appointment System.</p>
        <p>You can now book appointments with top doctors.</p>
        <p>Thank you for registering!</p>
      `
    });
  } catch (err) {
    console.log('Email error (non-critical):', err.message);
    // Don't crash if email fails — it's optional
  }
};

// ---- REGISTER ----
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create the user (password will be hashed by User model)
    const user = await User.create({ name, email, password, role: role || 'patient', phone });

    // If registering as doctor, create a doctor profile too
    if (role === 'doctor') {
      const doctor = await Doctor.create({
        userId: user._id,
        name: user.name,
        specialization: req.body.specialization || 'General Physician',
        experience: req.body.experience || 0,
        fees: req.body.fees || 500
      });
      user.doctorId = doctor._id;
      await user.save();
    }

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Send back user data + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- LOGIN ----
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Send response with token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET PROFILE ----
// GET /api/auth/profile  (requires login)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- UPDATE PROFILE ----
// PUT /api/auth/profile  (requires login)
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.password) {
      user.password = req.body.password; // Will be re-hashed by pre-save hook
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
