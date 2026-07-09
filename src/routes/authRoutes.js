const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/signup',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .isLength({ min: 10, max: 15 })
      .withMessage('Phone number must be between 10 and 15 digits')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only digits'),
    body('pin')
      .notEmpty()
      .withMessage('PIN is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('PIN must be exactly 4 digits')
      .matches(/^[0-9]+$/)
      .withMessage('PIN must contain only digits'),
    body('referral_code')
      .optional()
      .isString()
      .withMessage('Referral code must be a string'),
  ],
  validateRequest,
  authController.signup
);

router.post(
  '/verify-otp',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only digits'),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('OTP must be 4 digits'),
  ],
  validateRequest,
  authController.verifyOtp
);

router.post(
  '/login',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only digits'),
    body('pin')
      .notEmpty()
      .withMessage('PIN is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('PIN must be 4 digits'),
  ],
  validateRequest,
  authController.login
);

router.post(
  '/forgot-password',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only digits'),
  ],
  validateRequest,
  authController.forgotPassword
);

router.post(
  '/verify-forgot-otp',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only digits'),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('OTP must be 4 digits'),
  ],
  validateRequest,
  authController.verifyForgotOtp
);

router.post(
  '/reset-pin',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only digits'),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('OTP must be 4 digits'),
    body('new_pin')
      .notEmpty()
      .withMessage('New PIN is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('PIN must be 4 digits'),
    body('confirm_pin')
      .notEmpty()
      .withMessage('Confirm PIN is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('PIN must be 4 digits'),
  ],
  validateRequest,
  authController.resetPin
);

router.get('/profile', authenticate, authController.getProfile);

router.put(
  '/profile',
  authenticate,
  upload.single('profile_image'),
  [
    body('name').optional().isString().withMessage('Name must be a string'),
  ],
  validateRequest,
  authController.updateProfile
);

module.exports = router;
