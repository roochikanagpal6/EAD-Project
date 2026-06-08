// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllDoctors,
  approveDoctorRequest,
  getAllAppointments,
  getDashboardStats,
  deleteUser
} = require('../controllers/adminController');
const { protect, role } = require('../middleware/authMiddleware');

// ALL routes here require login + admin role
router.use(protect, role('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/doctors', getAllDoctors);
router.put('/doctor/approve/:id', approveDoctorRequest);
router.get('/appointments', getAllAppointments);
router.delete('/user/:id', deleteUser);

module.exports = router;
