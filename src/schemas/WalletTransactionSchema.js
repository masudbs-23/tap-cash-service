const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trx_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    sender_wallet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    receiver_wallet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    fee: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'RESERVED', 'SUCCESS', 'FAILED'),
      defaultValue: 'PENDING',
    },
    type: {
      type: DataTypes.ENUM('SEND_MONEY', 'REFERRAL_BONUS', 'WELCOME_BONUS'),
      allowNull: false,
    },
  }, {
    tableName: 'wallet_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return WalletTransaction;
};
