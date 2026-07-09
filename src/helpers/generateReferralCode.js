const { v4: uuidv4 } = require('uuid');

const generateReferralCode = () => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8);
  return `REF${uuid.toUpperCase()}`;
};

module.exports = generateReferralCode;
