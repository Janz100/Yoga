// Core Modules & Middleware
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

// DB Initialization
const { createUserTable } = require('./models/userModel');
const { createBookingTable } = require('./models/bookingModel');



// Route Files
const authRoutes = require('./routes/authRoutes');
const instructorRoutes = require('./routes/instructorRoutes');


// Express App
const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// 🔧 Middleware Configuration
// ===========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files (e.g., CSS, JS, images) from "public"
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretkey',
  resave: false,
  saveUninitialized: true,
}));

// ===========================
// 🎨 View Engine Setup (EJS)
// ===========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===========================
// 📦 Routing
// ===========================
app.use('/', authRoutes);
app.use('/', instructorRoutes);

// ===========================
// 📅 Booking Route
// ===========================
app.post('/book', (req, res) => {
  const { name, email, phone, date, time, type, goals } = req.body;

  console.log("📥 New booking received:");
  console.log(req.body);

  // TODO: Save to database (e.g., INSERT INTO bookings)

  res.status(200).json({ message: "Booking confirmed" });
});

// ===========================
// 🚪 Logout Route
// ===========================
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ===========================
// 📂 Initialize Database Tables
// ===========================
createUserTable();
createBookingTable();
 // Ensures user table exists on startup

// ===========================
// 🚀 Start Server
// ===========================
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
