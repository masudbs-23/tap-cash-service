const UserModel = require('../models/UserModel');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

exports.signup = async (req, res, next) => {
  try {
    const { phone, pin, referral_code } = req.body;

    const result = await UserModel.signup(phone, pin, referral_code);

    return successResponse(
      res,
      'User registered successfully. Please verify OTP.',
      result,
      201
    );
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const result = await UserModel.verifyOtp(phone, otp);

    return successResponse(res, 'OTP verified successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, pin } = req.body;

    const result = await UserModel.login(phone, pin);

    return successResponse(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const result = await UserModel.forgotPassword(phone);

    return successResponse(res, 'OTP sent successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.verifyForgotOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const result = await UserModel.verifyForgotOtp(phone, otp);

    return successResponse(res, 'OTP verified successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.resetPin = async (req, res, next) => {
  try {
    const { phone, otp, new_pin, confirm_pin } = req.body;

    const result = await UserModel.resetPin(phone, otp, new_pin, confirm_pin);

    return successResponse(res, 'PIN reset successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await UserModel.getProfile(userId);

    return successResponse(res, 'Profile retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    const result = await UserModel.updateProfile(userId, name, profileImage);

    return successResponse(res, 'Profile updated successfully', result);
  } catch (error) {
    next(error);
  }
};
