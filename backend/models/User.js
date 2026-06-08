// models/User.js
// Defines the User schema in MongoDB
// One schema handles all roles: patient, doctor, admin

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,           // No duplicate emails
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'], // Only these 3 roles allowed
      default: 'patient'
    },
    phone: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    // For doctors: link to their Doctor profile
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// ---- HASH PASSWORD BEFORE SAVING ----
// This runs automatically before every save()
userSchema.pre('save', async function (next) {
  // Only hash if password was changed (not on other updates)
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- METHOD: Check if password is correct ----
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
