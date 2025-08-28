const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const OTP = require('../models/otp');
const sendEmail = require('../utils/sendEmail');

// Forgot password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address'
      });
    }

    // Generate OTP instead of reset token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp });

    // Log OTP for development
    console.log(`🎯 Password reset OTP for ${email}: ${otp}`);

    try {
      // Check if we should send real emails
      if (process.env.NODE_ENV === 'development' && process.env.SEND_REAL_EMAILS === 'false') {
        console.log('=== PASSWORD RESET EMAIL (NOT SENT - DEVELOPMENT MODE) ===');
        console.log('To:', email);
        console.log('Subject:', 'Your OTP for password reset');
        console.log('Message:', `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`);
        console.log('==========================================================');
      } else {
        // Send real email
        await sendEmail({
          email: user.email,
          subject: 'Your OTP for password reset',
          message: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`
        });
        console.log('✅ Password reset OTP email sent successfully');
      }

      res.status(200).json({
        status: 'success',
        message: 'OTP sent to email!'
      });
    } catch (err) {
      console.error('❌ Email sending error:', err.message);
      await OTP.deleteOne({ email, otp });
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Verify OTP for password reset
exports.verifyOtpForPasswordReset = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    const now = new Date();
    const otpAge = now - otpRecord.createdAt;
    const tenMinutes = 10 * 60 * 1000;
    
    if (otpAge > tenMinutes) {
      await OTP.deleteOne({ email, otp });
      return res.status(400).json({
        status: 'fail',
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // OTP is valid - delete it and allow password reset
    await OTP.deleteOne({ email, otp });

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully. You can now reset your password.'
    });
  } catch (err) {
    console.error('OTP verification error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Reset password after OTP verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    user.password = password;
    // Don't set isVerified here - it should already be true from registration
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update password (for logged-in users)
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is wrong'
      });
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Update password error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};