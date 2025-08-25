const User = require('../models/User');

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Update user profile
exports.updateMe = async (req, res) => {
  try {
    const filteredBody = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone
    };

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Delete user account
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
