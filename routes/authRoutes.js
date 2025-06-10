const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController'); 
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

// root route 
router.get('/', (req, res) => { 
  res.render('landing'); 
}); 

// Signup 
router.get('/signup', authController.getSignup); 
router.post('/signup', authController.postSignup); 

// Email verification 
router.get('/verify-email', authController.verifyEmail); 

// Login 
router.get('/login', authController.getLogin); 
router.post('/login', authController.postLogin); 

// Forgot and reset password routes 
router.get('/forgot-password', authController.getForgotPassword); 
router.post('/forgot-password', authController.forgotPassword); 
router.get('/reset-password', authController.getResetPassword); 
router.post('/reset-password', authController.resetPassword); 

// Protected routes
router.get('/index', isLoggedIn, authController.getIndex);
router.get('/admin/dashboard', isLoggedIn, authController.getAdminDashboard);

module.exports = router;
