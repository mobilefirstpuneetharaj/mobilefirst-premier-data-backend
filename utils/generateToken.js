const jwt = require('jsonwebtoken');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};

 // Calculate cookie expiration based on JWT_EXPIRES_IN
  const expiresInDays = process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 1;

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
 const cookieOptions = {
  expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
  httpOnly: true,
  sameSite: "lax",
};

  // ✅ Only secure in production; localhost needs non-secure cookies
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

module.exports = { signToken, createSendToken };
