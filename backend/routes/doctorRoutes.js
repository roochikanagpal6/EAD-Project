// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, updateDoctorProfile, getMyDoctorProfile } = require('../controllers/doctorController');
const { protect, role } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Doctor only
router.get('/me/profile', protect, role('doctor'), getMyDoctorProfile);
router.put('/me/profile', protect, role('doctor'), updateDoctorProfile);

module.exports = router;
