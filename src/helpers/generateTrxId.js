const { v4: uuidv4 } = require('uuid');

const generateTrxId = () => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 12);
  return `TRX${uuid.toUpperCase()}`;
};

module.exports = generateTrxId;
