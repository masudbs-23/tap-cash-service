const { verifyToken } = require('../utils/jwtHelper');
const { errorResponse } = require('../helpers/responseHelper');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required', null, 401);
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', null, 401);
  }
};

module.exports = { authenticate };
