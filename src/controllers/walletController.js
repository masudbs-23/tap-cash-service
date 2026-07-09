const WalletModel = require('../models/WalletModel');
const UserModel = require('../models/UserModel');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

exports.sendMoney = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { receiver_phone, amount, pin } = req.body;

    await UserModel.verifyPin(userId, pin);

    const result = await WalletModel.sendMoney(userId, receiver_phone, parseFloat(amount), pin);

    return successResponse(res, 'Money sent successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const wallet = await WalletModel.getWalletByUserId(userId);

    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await WalletModel.getTransactionHistory(wallet.id, limit, offset);

    return successResponse(res, 'Transaction history retrieved successfully', transactions);
  } catch (error) {
    next(error);
  }
};

exports.getTransactionByTrxId = async (req, res, next) => {
  try {
    const { trxId } = req.params;

    const transaction = await WalletModel.getTransactionByTrxId(trxId);

    return successResponse(res, 'Transaction retrieved successfully', transaction);
  } catch (error) {
    next(error);
  }
};
