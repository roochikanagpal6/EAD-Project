// controllers/doctorController.js
// Handles: Get all doctors, get single doctor, update doctor profile

const Doctor = require('../models/Doctor');

// ---- GET ALL APPROVED DOCTORS ----
// GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    // Optional: filter by specialization
    const filter = { isApproved: true };
    if (req.query.specialization) {
      filter.specialization = req.query.specialization;
    }

    const doctors = await Doctor.find(filter).select('-slots'); // hide slots for listing
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET SINGLE DOCTOR ----
// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- UPDATE DOCTOR PROFILE (doctor only) ----
// PUT /api/doctors/profile
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const { specialization, experience, fees, about, slots, availableDays } = req.body;
    if (specialization) doctor.specialization = specialization;
    if (experience) doctor.experience = experience;
    if (fees) doctor.fees = fees;
    if (about) doctor.about = about;
    if (slots) doctor.slots = slots;
    if (availableDays) doctor.availableDays = availableDays;

    const updated = await doctor.save();
    res.json({ message: 'Profile updated!', doctor: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET MY DOCTOR PROFILE ----
// GET /api/doctors/me
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllDoctors, getDoctorById, updateDoctorProfile, getMyDoctorProfile };
