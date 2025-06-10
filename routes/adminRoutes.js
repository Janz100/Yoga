const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/bookings', isLoggedIn, authController.getAdminDashboard);

module.exports = router;
