const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// Import middlewares
const { authenticate } = require('../middlewares/authMiddleware');

// Import validations
const {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/authValidation');

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword);
router.post('/logout', logout);

module.exports = router;