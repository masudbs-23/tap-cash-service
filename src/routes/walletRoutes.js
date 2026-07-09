const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const walletController = require('../controllers/walletController');

const router = express.Router();

router.post(
  '/send-money',
  authenticate,
  [
    body('receiver_phone')
      .notEmpty()
      .withMessage('Receiver phone number is required')
      .matches(/^[0-9]+$/)
      .withMessage('Phone number must contain only digits'),
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be greater than 0'),
    body('pin')
      .notEmpty()
      .withMessage('PIN is required')
      .isLength({ min: 4, max: 4 })
      .withMessage('PIN must be 4 digits'),
  ],
  validateRequest,
  walletController.sendMoney
);

router.get(
  '/transactions',
  authenticate,
  walletController.getTransactionHistory
);

router.get(
  '/transactions/:trxId',
  authenticate,
  walletController.getTransactionByTrxId
);

module.exports = router;
