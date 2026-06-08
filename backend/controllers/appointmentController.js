// controllers/appointmentController.js
// Handles: Book, View, Cancel, Update appointments

const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Helper: send appointment confirmation email
const sendAppointmentEmail = async (patientEmail, patientName, doctorName, date, time) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: `"Doctor Appointment" <${process.env.EMAIL_USER}>`,
      to: patientEmail,
      subject: 'Appointment Confirmation',
      html: `
        <h2>Appointment Confirmed ✅</h2>
        <p>Hi <b>${patientName}</b>,</p>
        <p>Your appointment with <b>Dr. ${doctorName}</b> is confirmed.</p>
        <p>📅 Date: <b>${date}</b></p>
        <p>⏰ Time: <b>${time}</b></p>
        <p>Please arrive 10 minutes early.</p>
      `
    });
  } catch (err) {
    console.log('Email error:', err.message);
  }
};

// ---- BOOK APPOINTMENT ----
// POST /api/appointments/book
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;

    // Check if doctor exists and is approved
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctor.isApproved) return res.status(400).json({ message: 'Doctor not approved yet' });

    // Check if slot is already taken
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' } // ignore cancelled ones
    });
    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      notes
    });

    // Send confirmation email
    const patient = await User.findById(req.user._id);
    await sendAppointmentEmail(patient.email, patient.name, doctor.name, date, time);

    res.status(201).json({ message: 'Appointment booked successfully!', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET PATIENT'S APPOINTMENTS ----
// GET /api/appointments/my
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization profileImage fees') // Get doctor details
      .sort({ createdAt: -1 }); // Newest first
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET DOCTOR'S APPOINTMENTS ----
// GET /api/appointments/doctor  (for doctors only)
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone') // Get patient details
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- CANCEL APPOINTMENT ----
// PUT /api/appointments/cancel/:id
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Only the patient who booked or an admin can cancel
    if (appointment.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- UPDATE APPOINTMENT STATUS (doctor only) ----
// PUT /api/appointments/status/:id
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'confirmed', 'completed', 'cancelled'
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: 'Status updated', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  updateAppointmentStatus
};
