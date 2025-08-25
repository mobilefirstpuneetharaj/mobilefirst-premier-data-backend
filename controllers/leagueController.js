const League = require('../models/League');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all leagues
// @route   GET /api/v1/leagues
// @access  Private
// Get all leagues with basic filtering
exports.getAllLeagues = async (req, res) => {
  try {
    const { country, season, status } = req.query;
    let filter = {};
    
    // Basic filtering
    if (country) filter.country = country;
    if (season) filter.season = season;
    if (status) filter.status = status;

    const leagues = await League.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: leagues.length,
      data: {
        leagues
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get single league
// @route   GET /api/v1/leagues/:id
// @access  Private
exports.getLeague = async (req, res) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({
        status: 'fail',
        message: 'League not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        league
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Create new league
// @route   POST /api/v1/leagues
// @access  Private
exports.createLeague = async (req, res) => {
  try {
    // Add user ID from authenticated user
    req.body.createdBy = req.user.id;
    
    const league = await League.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        league
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'League with this name already exists for this season and country'
      });
    }
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update league
// @route   PATCH /api/v1/leagues/:id
// @access  Private
exports.updateLeague = async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!league) {
      return res.status(404).json({
        status: 'fail',
        message: 'League not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        league
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Delete league
// @route   DELETE /api/v1/leagues/:id
// @access  Private
exports.deleteLeague = async (req, res) => {
  try {
    const league = await League.findByIdAndDelete(req.params.id);

    if (!league) {
      return res.status(404).json({
        status: 'fail',
        message: 'League not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get league statistics
// @route   GET /api/v1/leagues/stats
// @access  Private
exports.getLeagueStats = async (req, res) => {
  try {
    const stats = await League.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCompetitions: { $sum: '$competitionsCount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};