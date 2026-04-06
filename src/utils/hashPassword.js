const bcrypt = require('bcryptjs');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} rounds - Number of salt rounds (default: from env or 12)
 * @returns {string} Hashed password
 */
const hashPassword = async (password, rounds = null) => {
  try {
    if (!password) {
      throw new Error('Password is required');
    }

    const saltRounds = rounds || parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {boolean} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      return false;
    }

    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors array
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};