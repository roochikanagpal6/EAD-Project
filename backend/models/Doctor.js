// models/Doctor.js
// Stores doctor-specific details (separate from User for clean separation)

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      // Examples: Cardiologist, Dermatologist, General Physician
    },
    experience: {
      type: Number, // Years of experience
      required: true
    },
    fees: {
      type: Number, // Consultation fee in PKR/USD
      required: true
    },
    about: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    // Available time slots (e.g. ["9:00 AM", "10:00 AM", "3:00 PM"])
    slots: {
      type: [String],
      default: []
    },
    // Days available (e.g. ["Monday", "Tuesday", "Wednesday"])
    availableDays: {
      type: [String],
      default: []
    },
    // true = approved by admin, false = pending approval
    isApproved: {
      type: Boolean,
      default: false
    },
    // Overall rating (calculated from reviews)
    rating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
