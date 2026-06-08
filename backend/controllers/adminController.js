// controllers/adminController.js
// Admin-only features: manage doctors, view all appointments, stats

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// ---- GET ALL USERS ----
// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET ALL DOCTORS (including unapproved) ----
// GET /api/admin/doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- APPROVE / REJECT DOCTOR ----
// PUT /api/admin/doctor/approve/:id
const approveDoctorRequest = async (req, res) => {
  try {
    const { isApproved } = req.body; // true = approve, false = reject
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({
      message: isApproved ? 'Doctor approved ✅' : 'Doctor rejected ❌',
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET ALL APPOINTMENTS ----
// GET /api/admin/appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- DASHBOARD STATS ----
// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments({ isApproved: true });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: false });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    res.json({
      totalUsers,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      completedAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- DELETE USER ----
// DELETE /api/admin/user/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllDoctors,
  approveDoctorRequest,
  getAllAppointments,
  getDashboardStats,
  deleteUser
};
