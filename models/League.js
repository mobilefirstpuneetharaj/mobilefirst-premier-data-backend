const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'League name is required'],
    trim: true,
    maxlength: [100, 'League name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  season: {
    type: String,
    required: [true, 'Season is required'],
    trim: true
  },
  competitionsCount: {
    type: Number,
    default: 0,
    min: [0, 'Competitions count cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Ongoing', 'Complete', 'Draft'],
    default: 'Active'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
leagueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create index for better query performance
leagueSchema.index({ name: 1, country: 1, season: 1 });

const League = mongoose.model('League', leagueSchema);

module.exports = League;