const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();


const saltRounds = 10;

// Setup reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Renders login form
exports.getLogin = (req, res) => {
  res.render('login', { message: null });
};

// Handles login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.render('login', { message: 'Invalid credentials!' });
    }

    if (!user.is_verified) {
      return res.render('login', { message: 'Please verify your email first.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { message: 'Invalid credentials!' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('jwt', token, { httpOnly: true });

    return user.role === 'admin'
      ? res.redirect('/admin/dashboard')
      : res.redirect('/index');
  } catch (error) {
    console.error(error);
    res.render('login', { message: 'Error during login.' });
  }
};

// Renders signup form
exports.getSignup = (req, res) => {
  res.render('signup', { message: null });
};

// Handles signup
exports.postSignup = async (req, res) => {
  let { name, email, password, role } = req.body;
  name = name?.trim();
  email = email?.trim().toLowerCase();
  role = role?.trim().toLowerCase();

  const allowedRoles = ['user', 'admin'];
  if (!allowedRoles.includes(role)) role = 'user';

  if (!name || !email || !password) {
    return res.render('signup', { message: 'Please fill in all required fields.' });
  }

  try {
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.render('signup', { message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await db.none(
      `INSERT INTO users (name, email, password, role, verification_token)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, hashedPassword, role, verificationToken]
    );

    const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"Yoga" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `<h3>Hello ${name},</h3>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${verificationLink}">Verify Email</a>`,
    });

    res.render('signup', { message: 'Signup successful! Check your email to verify.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.render('signup', { message: 'Error during signup. Please try again later.' });
  }
};

// Email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await db.none(
      `UPDATE users SET is_verified = true, verification_token = null WHERE email = $1`,
      [decoded.email]
    );
    res.send('✅ Email verified successfully. You can now log in.');
  } catch (error) {
    res.send('❌ Invalid or expired verification link.');
  }
};

// Renders forgot password form
exports.getForgotPassword = (req, res) => {
  res.render('forgot-password', { message: null });
};

// Handles forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.render('forgot-password', { message: 'Email not found' });
    }

    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await db.none('UPDATE users SET reset_token = $1 WHERE email = $2', [resetToken, email]);

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link below to reset your password:\n\n${resetLink}`,
    });

    res.render('forgot-password', { message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.render('forgot-password', { message: 'Something went wrong. Please try again.' });
  }
};

// Renders reset password form
exports.getResetPassword = (req, res) => {
  const { token } = req.query;
  res.render('reset-password', { token, message: null });
};

// Handles reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [decoded.email]);

    if (!user) {
      return res.render('reset-password', { message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.none('UPDATE users SET password = $1, reset_token = NULL WHERE email = $2', [hashedPassword, decoded.email]);

    res.render('reset-password', { message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    res.render('reset-password', { message: 'Invalid or expired token' });
  }
};

// Renders user dashboard
exports.getIndex = (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).send('Access denied');
  }
  res.render('index', { user: req.user });
};

// Renders admin dashboard
exports.getAdminDashboard = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }
  res.render('AdminBookings', { user: req.user });
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const bookings = await db.any('SELECT * FROM bookings ORDER BY date');
    res.render('AdminBookings', { bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send('Server Error');
  }
};
