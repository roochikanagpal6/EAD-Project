# 🏥 Doctor Appointment System — MERN Stack

A full-stack web application for booking doctor appointments.
Built with **MongoDB + Express + React + Node.js (MERN)**.

---

## ✅ Features
- Patient: Register, search doctors, book appointments, pay online
- Doctor: Dashboard to manage appointments, update profile/slots
- Admin: Approve doctors, manage users, view stats
- Auth: JWT-based login with role-based access (patient / doctor / admin)
- Payments: Stripe integration
- Emails: Nodemailer sends confirmation emails

---

## 📁 Project Structure

```
doctor-appointment/
├── backend/                  ← Node.js + Express API
│   ├── server.js             ← Entry point, starts server
│   ├── config/db.js          ← MongoDB connection
│   ├── models/               ← MongoDB schemas
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── controllers/          ← Business logic
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   ├── doctorController.js
│   │   └── adminController.js
│   ├── routes/               ← API endpoints
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── adminRoutes.js
│   │   └── paymentRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT protection + role check
│   └── .env.example          ← Copy to .env and fill values
│
└── frontend/                 ← React app (Vite)
    ├── src/
    │   ├── main.jsx          ← App entry point
    │   ├── App.jsx           ← All routes defined here
    │   ├── index.css         ← Global styles
    │   ├── api/axios.js      ← Axios with auto token attach
    │   ├── context/
    │   │   └── AuthContext.jsx  ← Global login state
    │   ├── components/
    │   │   └── Navbar.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Home.jsx              ← Doctor listings
    │       ├── BookAppointment.jsx
    │       ├── PatientDashboard.jsx
    │       ├── DoctorDashboard.jsx
    │       ├── AdminDashboard.jsx
    │       └── Payment.jsx           ← Stripe payment
    ├── index.html
    ├── vite.config.js
    └── .env                  ← API URL + Stripe key
```

---

## 🚀 HOW TO RUN — Step by Step

### Step 1: Install Required Software
Make sure you have these installed:
- **Node.js** (download from https://nodejs.org) — version 18+
- **VS Code** (code editor)
- A MongoDB Atlas account (free at https://cloud.mongodb.com)

### Step 2: Set Up MongoDB Atlas (Free Cloud Database)
1. Go to https://cloud.mongodb.com and create a free account
2. Create a new Project → Create a free Cluster (M0 Free)
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://...`)
5. Replace `<password>` with your DB password in the string

### Step 3: Set Up Backend

```bash
# 1. Open terminal, go to backend folder
cd doctor-appointment/backend

# 2. Install all packages
npm install

# 3. Create your .env file (copy from example)
cp .env.example .env

# 4. Open .env in VS Code and fill in:
#    - MONGO_URI (from Step 2)
#    - JWT_SECRET (any long random string, like: "mySuperSecret123!")
#    - EMAIL_USER and EMAIL_PASS (your Gmail + App Password)
#    - STRIPE_SECRET_KEY (from https://stripe.com → Developers → API keys)

# 5. Start the backend
npm run dev
```
✅ You should see: `🚀 Server running on http://localhost:5000`

### Step 4: Set Up Frontend

```bash
# 1. Open a NEW terminal, go to frontend folder
cd doctor-appointment/frontend

# 2. Install all packages
npm install

# 3. Open .env and add your Stripe PUBLISHABLE key
#    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 4. Start the frontend
npm run dev
```
✅ Open browser at: http://localhost:5173

---

## 👤 Creating an Admin Account

The admin account must be created manually in MongoDB:

1. Register normally as any user
2. Go to MongoDB Atlas → your cluster → Browse Collections → users
3. Find your user → Edit → change `role` from `"patient"` to `"admin"`
4. Save → Login again

---

## 🧪 Testing Payments (Stripe Test Mode)
Use these test card details:
- Card Number: **4242 4242 4242 4242**
- Expiry: Any future date (e.g. 12/26)
- CVC: Any 3 digits (e.g. 123)

---

## 📡 API Endpoints Reference

| Method | URL | Who can use |
|--------|-----|-------------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/profile | Logged in |
| GET | /api/doctors | Public |
| GET | /api/doctors/:id | Public |
| PUT | /api/doctors/me/profile | Doctor only |
| POST | /api/appointments/book | Patient only |
| GET | /api/appointments/my | Patient only |
| GET | /api/appointments/doctor | Doctor only |
| PUT | /api/appointments/cancel/:id | Patient/Admin |
| PUT | /api/appointments/status/:id | Doctor/Admin |
| GET | /api/admin/stats | Admin only |
| GET | /api/admin/doctors | Admin only |
| PUT | /api/admin/doctor/approve/:id | Admin only |
| POST | /api/payment/create-payment-intent | Patient |
| POST | /api/payment/confirm | Patient |

---

## 📦 Tech Stack Used

**Backend:**
- express — web framework
- mongoose — MongoDB ORM
- bcryptjs — password hashing
- jsonwebtoken — JWT auth
- nodemailer — emails
- stripe — payments
- cors — allow frontend requests
- dotenv — environment variables

**Frontend:**
- react + react-dom — UI
- react-router-dom — page routing
- axios — HTTP requests
- react-hot-toast — notifications
- @stripe/react-stripe-js — Stripe payment UI

---

## ❓ Common Issues

**"Cannot connect to MongoDB"**
→ Check your MONGO_URI in .env. Make sure your IP is whitelisted in Atlas (Network Access → Add 0.0.0.0/0 for development)

**"Token not found" errors**
→ Make sure you're logged in. Token is stored in localStorage.

**Stripe payment not working**
→ Make sure you're using TEST keys (starts with sk_test_ and pk_test_)

**Emails not sending**
→ Gmail requires an "App Password". Go to Google Account → Security → 2-Step Verification → App Passwords

---

Built with ❤️ as a Final Year Project
