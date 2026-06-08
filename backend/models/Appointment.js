// models/Appointment.js
// Stores each booking made by a patient with a doctor

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    date: {
      type: String, // e.g. "2024-08-15"
      required: true
    },
    time: {
      type: String, // e.g. "10:00 AM"
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid'
    },
    paymentId: {
      type: String, // Stripe payment intent ID
      default: ''
    },
    notes: {
      type: String, // Patient's message to the doctor
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
