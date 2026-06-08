// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, role } = require('../middleware/authMiddleware');

// Patient routes
router.post('/book', protect, role('patient'), bookAppointment);
router.get('/my', protect, role('patient'), getMyAppointments);
router.put('/cancel/:id', protect, cancelAppointment);

// Doctor routes
router.get('/doctor', protect, role('doctor'), getDoctorAppointments);
router.put('/status/:id', protect, role('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
