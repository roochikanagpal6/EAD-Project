// routes/paymentRoutes.js
// Stripe payment integration
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/authMiddleware');

// ---- CREATE PAYMENT INTENT ----
// POST /api/payment/create-payment-intent
// Frontend calls this to get a clientSecret, then uses Stripe.js to confirm payment
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('doctorId');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const amountInCents = appointment.doctorId.fees * 100; // Stripe uses cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', // Change to 'pkr' if needed
      metadata: { appointmentId: appointmentId.toString() }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- CONFIRM PAYMENT ----
// POST /api/payment/confirm
// Called after successful Stripe payment on frontend
router.post('/confirm', protect, async (req, res) => {
  try {
    const { appointmentId, paymentIntentId } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        paymentStatus: 'paid',
        paymentId: paymentIntentId,
        status: 'confirmed'
      },
      { new: true }
    );

    res.json({ message: 'Payment confirmed! Appointment confirmed.', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
