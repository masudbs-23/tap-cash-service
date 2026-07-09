const { User, Wallet, WalletTransaction, sequelize } = require('../database');
const bcrypt = require('bcrypt');
const { OTP, PIN, WALLET } = require('../constants');
const generateReferralCode = require('../helpers/generateReferralCode');
const generateTrxId = require('../helpers/generateTrxId');
const { generateToken } = require('../utils/jwtHelper');

exports.signup = async (phone, pin, referralCode) => {
  const transaction = await sequelize.transaction();

  try {
    const existingUser = await User.findOne({
      where: { phone },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      throw new Error('Phone number already registered');
    }

    if (pin.length !== PIN.LENGTH) {
      await transaction.rollback();
      throw new Error('PIN must be exactly 4 digits');
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const newReferralCode = generateReferralCode();

    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + OTP.OTP_EXPIRY_MINUTES);

    const user = await User.create(
      {
        phone,
        pin: hashedPin,
        referral_code: newReferralCode,
        referred_by: referralCode || null,
        otp: OTP.FIXED_OTP,
        otp_expiry: otpExpiry,
        is_verified: false,
      },
      { transaction }
    );

    const wallet = await Wallet.create(
      {
        user_id: user.id,
        balance: WALLET.INITIAL_BALANCE,
        reserved_balance: 0,
      },
      { transaction }
    );

    await WalletTransaction.create(
      {
        trx_id: generateTrxId(),
        receiver_wallet: wallet.id,
        amount: WALLET.INITIAL_BALANCE,
        fee: 0,
        status: 'SUCCESS',
        type: 'WELCOME_BONUS',
      },
      { transaction }
    );

    if (referralCode) {
      const referrer = await User.findOne({
        where: { referral_code: referralCode },
        include: [{ model: Wallet, as: 'wallet' }],
        transaction,
      });

      if (referrer && referrer.wallet) {
        await referrer.wallet.increment('balance', {
          by: WALLET.REFERRAL_BONUS,
          transaction,
        });

        await WalletTransaction.create(
          {
            trx_id: generateTrxId(),
            receiver_wallet: referrer.wallet.id,
            amount: WALLET.REFERRAL_BONUS,
            fee: 0,
            status: 'SUCCESS',
            type: 'REFERRAL_BONUS',
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return {
      id: user.id,
      phone: user.phone,
      referral_code: user.referral_code,
      is_verified: user.is_verified,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.verifyOtp = async (phone, otp) => {
  const user = await User.findOne({ where: { phone } });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  const now = new Date();
  if (now > user.otp_expiry) {
    throw new Error('OTP has expired');
  }

  await user.update({
    is_verified: true,
    otp: null,
    otp_expiry: null,
  });

  const token = generateToken({ userId: user.id, phone: user.phone });

  return {
    token,
    user: {
      id: user.id,
      phone: user.phone,
      referral_code: user.referral_code,
      is_verified: user.is_verified,
    },
  };
};

exports.resendOtp = async (phone) => {
  const user = await User.findOne({ where: { phone } });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.is_verified) {
    throw new Error('Account already verified');
  }

  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + OTP.OTP_EXPIRY_MINUTES);

  await user.update({
    otp: OTP.FIXED_OTP,
    otp_expiry: otpExpiry,
  });

  return {
    phone: user.phone,
    message: 'OTP resent successfully',
  };
};

exports.login = async (phone, pin) => {
  const user = await User.findOne({ where: { phone } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPinValid = await bcrypt.compare(pin, user.pin);

  if (!isPinValid) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_verified) {
    throw new Error('Account not verified. Please verify your OTP first.');
  }

  const token = generateToken({ userId: user.id, phone: user.phone });

  return {
    token,
    user: {
      id: user.id,
      phone: user.phone,
      referral_code: user.referral_code,
      is_verified: user.is_verified,
    },
  };
};

exports.forgotPassword = async (phone) => {
  const user = await User.findOne({ where: { phone } });

  if (!user) {
    throw new Error('User not found');
  }

  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + OTP.OTP_EXPIRY_MINUTES);

  await user.update({
    otp: OTP.FIXED_OTP,
    otp_expiry: otpExpiry,
  });

  return {
    phone: user.phone,
    message: 'OTP sent successfully',
  };
};

exports.verifyForgotOtp = async (phone, otp) => {
  const user = await User.findOne({ where: { phone } });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  const now = new Date();
  if (now > user.otp_expiry) {
    throw new Error('OTP has expired');
  }

  return {
    phone: user.phone,
    message: 'OTP verified successfully',
  };
};

exports.resetPin = async (phone, otp, newPin, confirmPin) => {
  const user = await User.findOne({ where: { phone } });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  const now = new Date();
  if (now > user.otp_expiry) {
    throw new Error('OTP has expired');
  }

  if (newPin !== confirmPin) {
    throw new Error('PINs do not match');
  }

  if (newPin.length !== PIN.LENGTH) {
    throw new Error('PIN must be exactly 4 digits');
  }

  const hashedPin = await bcrypt.hash(newPin, 10);

  await user.update({
    pin: hashedPin,
    otp: null,
    otp_expiry: null,
  });

  return {
    phone: user.phone,
    message: 'PIN reset successfully',
  };
};

exports.getProfile = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    include: [{ model: Wallet, as: 'wallet' }],
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    name: user.name,
    phone: user.phone,
    balance: user.wallet ? parseFloat(user.wallet.balance) : 0,
    reserved_balance: user.wallet ? parseFloat(user.wallet.reserved_balance) : 0,
    profile_image: user.profile_image,
    referral_code: user.referral_code,
  };
};

exports.updateProfile = async (userId, name, profileImage) => {
  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (profileImage) updateData.profile_image = profileImage;

  await user.update(updateData);

  return {
    name: user.name,
    phone: user.phone,
    profile_image: user.profile_image,
    referral_code: user.referral_code,
  };
};

exports.getUserByPhone = async (phone) => {
  return await User.findOne({ where: { phone } });
};

exports.getUserByReferralCode = async (referralCode) => {
  return await User.findOne({
    where: { referral_code: referralCode },
    include: [{ model: Wallet, as: 'wallet' }],
  });
};

exports.verifyPin = async (userId, pin) => {
  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const isPinValid = await bcrypt.compare(pin, user.pin);

  if (!isPinValid) {
    throw new Error('Invalid PIN');
  }

  return true;
};
