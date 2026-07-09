const { Wallet, WalletTransaction, User, sequelize } = require('../database');
const { TRANSACTION_STATUS, TRANSACTION_TYPE } = require('../constants');
const generateTrxId = require('../helpers/generateTrxId');

exports.getWalletByUserId = async (userId) => {
  const wallet = await Wallet.findOne({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'phone', 'name', 'referral_code'],
      },
    ],
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  return wallet;
};

exports.getBalance = async (userId) => {
  const wallet = await Wallet.findOne({
    where: { user_id: userId },
    attributes: ['balance', 'reserved_balance'],
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  return {
    balance: parseFloat(wallet.balance),
    reserved_balance: parseFloat(wallet.reserved_balance),
    available_balance: parseFloat(wallet.balance) - parseFloat(wallet.reserved_balance),
  };
};

exports.getWalletById = async (walletId) => {
  const wallet = await Wallet.findByPk(walletId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'phone', 'name', 'referral_code'],
      },
    ],
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  return wallet;
};

exports.sendMoney = async (senderUserId, receiverPhone, amount, pin) => {
  const transaction = await sequelize.transaction();

  try {
    if (amount <= 0) {
      await transaction.rollback();
      throw new Error('Amount must be positive');
    }

    const senderWallet = await Wallet.findOne({
      where: { user_id: senderUserId },
      transaction,
    });

    if (!senderWallet) {
      await transaction.rollback();
      throw new Error('Sender wallet not found');
    }

    const receiverUser = await User.findOne({
      where: { phone: receiverPhone },
      transaction,
    });

    if (!receiverUser) {
      await transaction.rollback();
      throw new Error('Receiver not found');
    }

    if (receiverUser.id === senderUserId) {
      await transaction.rollback();
      throw new Error('Cannot send money to yourself');
    }

    const receiverWallet = await Wallet.findOne({
      where: { user_id: receiverUser.id },
      transaction,
    });

    if (!receiverWallet) {
      await transaction.rollback();
      throw new Error('Receiver wallet not found');
    }

    const availableBalance = parseFloat(senderWallet.balance) - parseFloat(senderWallet.reserved_balance);

    if (availableBalance < amount) {
      await transaction.rollback();
      throw new Error('Insufficient balance');
    }

    const trxId = generateTrxId();

    const walletTransaction = await WalletTransaction.create(
      {
        trx_id: trxId,
        sender_wallet: senderWallet.id,
        receiver_wallet: receiverWallet.id,
        amount: amount,
        fee: 0,
        status: TRANSACTION_STATUS.RESERVED,
        type: TRANSACTION_TYPE.SEND_MONEY,
      },
      { transaction }
    );

    await senderWallet.increment('reserved_balance', {
      by: amount,
      transaction,
    });

    await senderWallet.decrement('balance', {
      by: amount,
      transaction,
    });

    await senderWallet.decrement('reserved_balance', {
      by: amount,
      transaction,
    });

    await receiverWallet.increment('balance', {
      by: amount,
      transaction,
    });

    await walletTransaction.update(
      { status: TRANSACTION_STATUS.SUCCESS },
      { transaction }
    );

    await transaction.commit();

    const updatedTransaction = await WalletTransaction.findByPk(walletTransaction.id, {
      include: [
        { model: Wallet, as: 'senderWallet', include: [{ model: User, as: 'user' }] },
        { model: Wallet, as: 'receiverWallet', include: [{ model: User, as: 'user' }] },
      ],
    });

    return updatedTransaction;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

exports.getTransactionHistory = async (walletId, limit = 20, offset = 0) => {
  const transactions = await WalletTransaction.findAll({
    where: {
      [sequelize.Op.or]: [
        { sender_wallet: walletId },
        { receiver_wallet: walletId },
      ],
    },
    include: [
      { model: Wallet, as: 'senderWallet', include: [{ model: User, as: 'user' }] },
      { model: Wallet, as: 'receiverWallet', include: [{ model: User, as: 'user' }] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return transactions;
};

exports.getTransactionByTrxId = async (trxId) => {
  const transaction = await WalletTransaction.findOne({
    where: { trx_id: trxId },
    include: [
      { model: Wallet, as: 'senderWallet', include: [{ model: User, as: 'user' }] },
      { model: Wallet, as: 'receiverWallet', include: [{ model: User, as: 'user' }] },
    ],
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  return transaction;
};

exports.checkBalance = async (userId, amount) => {
  const wallet = await Wallet.findOne({ where: { user_id: userId } });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const availableBalance = parseFloat(wallet.balance) - parseFloat(wallet.reserved_balance);

  return availableBalance >= amount;
};
