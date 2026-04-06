const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in the token
 * @param {string} expiresIn - Token expiration time (default: from env or 7d)
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = null) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const options = {};
    if (expiresIn) {
      options.expiresIn = expiresIn;
    } else {
      options.expiresIn = process.env.JWT_EXPIRE || '7d';
    }

    return jwt.sign(payload, secret, options);
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Generate refresh token with longer expiration
 * @param {Object} payload - Data to encode in the token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, { expiresIn: '30d' });
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
};