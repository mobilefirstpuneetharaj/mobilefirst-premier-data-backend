const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new ErrorResponse('The user belonging to this token no longer exists', 401));
    }

    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new ErrorResponse('User recently changed password! Please log in again', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};
