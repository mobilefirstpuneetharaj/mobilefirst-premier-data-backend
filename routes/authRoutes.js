const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

module.exports = router;
