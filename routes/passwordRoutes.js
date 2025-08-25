const express = require('express');
const passwordController = require('../controllers/passwordController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/forgot-password', passwordController.forgotPassword);
router.post('/verify-reset-otp', passwordController.verifyOtpForPasswordReset);
router.post('/reset-password', passwordController.resetPassword);
router.patch('/update-password', authController.protect, passwordController.updatePassword);

module.exports = router;