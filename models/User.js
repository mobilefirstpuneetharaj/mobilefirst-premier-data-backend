const mongoose = require('mongoose'); // MongoDB ODM (Object Data Modeling)
const bcrypt = require('bcryptjs');

// Define the User schema (structure of documents in 'users' collection)
const userSchema = new mongoose.Schema({
  // Required fields from frontend signup form
  firstName: {
    type: String, // Data type
    required: [true, 'First name is required'], // Validation with custom error
    trim: true // Automatically removes whitespace
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Creates unique index in MongoDB
    lowercase: true, // Converts to lowercase before saving
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6, // Minimum length validation
    select: false // Excludes from query results by default
  },

  // Backend-managed fields
  isVerified: {
    type: Boolean,
    default: false // Changed to true after OTP verification
  },
  passwordChangedAt: { // Critical for security
    type: Date,
    select: false // Hidden from queries
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set on creation
  }
});

/* ===== MIDDLEWARE ===== */
// Runs before saving any user document
userSchema.pre('save', async function(next) {
  // Only hash password if it was modified (not on other updates)
  if (!this.isModified('password')) return next();
  
  // Hash password with cost factor of 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Set passwordChangedAt timestamp (minus 1 second for token validity)
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/* ===== INSTANCE METHODS ===== */
// Available on all user documents

// 1. Password comparison method
userSchema.methods.correctPassword = async function(
  candidatePassword, // Plain text from login request
  userPassword // Hashed password from DB
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 2. Password change detection (for JWT invalidation)
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Convert to timestamp (seconds)
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // True = password changed after token issued
    return JWTTimestamp < changedTimestamp;
  }
  return false; // Default = NOT changed
};

// Create the User model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;