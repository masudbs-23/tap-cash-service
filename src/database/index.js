const { sequelize } = require('../config/database');
const UserSchema = require('../schemas/UserSchema');
const WalletSchema = require('../schemas/WalletSchema');
const WalletTransactionSchema = require('../schemas/WalletTransactionSchema');

const User = UserSchema(sequelize);
const Wallet = WalletSchema(sequelize);
const WalletTransaction = WalletTransactionSchema(sequelize);

User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Wallet.hasMany(WalletTransaction, { foreignKey: 'sender_wallet', as: 'sentTransactions' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'sender_wallet', as: 'senderWallet' });

Wallet.hasMany(WalletTransaction, { foreignKey: 'receiver_wallet', as: 'receivedTransactions' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'receiver_wallet', as: 'receiverWallet' });

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Wallet,
  WalletTransaction,
  syncDatabase,
};
