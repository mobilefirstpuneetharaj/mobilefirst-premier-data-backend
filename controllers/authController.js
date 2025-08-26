const User = require('../models/User');
const OTP = require('../models/otp');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail = require('../utils/sendEmail');
const { createSendToken } = require('../utils/generateToken');

// // Register a new user
// exports.register = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ status: 'fail', message: 'Email already in use' });
//     }

//     const newUser = await User.create({ firstName, lastName, email, password });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     await OTP.create({ email, otp });

//     // Always log OTP to console for development (extremely helpful for testing)
//     console.log(`🎯 OTP for ${email}: ${otp}`);
//     console.log(`📧 Email would be sent to: ${email}`);

//     try {
//       await sendEmail({
//         email: newUser.email,
//         subject: 'Your OTP for verification',
//         message: `Your OTP for verification is: ${otp}`
//       });
//       console.log('✅ OTP email sent successfully');
//     } catch (emailError) {
//       console.error('❌ Failed to send OTP email:', emailError.message);
//       // Don't fail the registration - user can request a new OTP later
//       // Continue with the registration process
//     }

//     createSendToken(newUser, 201, res);
//   } catch (err) {
//     console.error('Registration error:', err.message);
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email already in use' });
    }

    // Create user with isVerified: true to skip OTP verification
    const newUser = await User.create({ 
      firstName, 
      lastName, 
      email, 
      password,
      isVerified: true // Set to true to skip OTP verification
    });

    // Still generate OTP for password reset functionality
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp });

    // Always log OTP to console for development
    console.log(`🎯 OTP for ${email}: ${otp}`);
    console.log(`📧 Email would be sent to: ${email}`);

    // Send welcome email instead of OTP email
    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Welcome to Premier Data',
        message: `Welcome ${firstName} ${lastName}! Your account has been successfully created.`
      });
      console.log('✅ Welcome email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError.message);
    }

    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// // Login user
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
//     }

//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !(await user.correctPassword(password, user.password))) {
//       return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
//     }

//     if (!user.isVerified) {
//       return res.status(401).json({ 
//         status: 'fail', 
//         message: 'Please verify your email first. Check your inbox for OTP or request a new one.' 
//       });
//     }

//     createSendToken(user, 200, res);
//   } catch (err) {
//     console.error('Login error:', err.message);
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };

// Login user - Remove OTP verification requirement
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // REMOVED OTP verification requirement for login
    // Users can login immediately after signup

    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Invalid OTP. Please check the code and try again.' 
      });
    }

    // Check if OTP is expired
    const now = new Date();
    const otpAge = now - otpRecord.createdAt;
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    if (otpAge > tenMinutes) {
      await OTP.deleteOne({ email, otp });
      return res.status(400).json({ 
        status: 'fail', 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteOne({ email, otp });

    res.status(200).json({ 
      status: 'success', 
      message: 'Email verified successfully! You can now login.' 
    });
  } catch (err) {
    console.error('OTP verification error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp });

    // Always log OTP to console for development
    console.log(`🎯 New OTP for ${email}: ${otp}`);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your new OTP for verification',
        message: `Your new OTP for verification is: ${otp}`
      });
      console.log('✅ New OTP email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send new OTP email:', emailError.message);
      // Still respond success since OTP was generated and logged
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'OTP resent successfully. Check your email (and console for development).' 
    });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Protect middleware
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'You are not logged in! Please log in to access this resource.' 
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'The user belonging to this token no longer exists.' 
      });
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'User recently changed password! Please log in again.' 
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.error('Authentication middleware error:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'Invalid token. Please log in again.' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'Your token has expired! Please log in again.' 
      });
    }

    res.status(401).json({ 
      status: 'fail', 
      message: 'Authentication failed. Please try again.' 
    });
  }
};