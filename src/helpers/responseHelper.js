const { RESPONSE } = require('../constants');

const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: RESPONSE.SUCCESS,
    message,
    data,
  });
};

const errorResponse = (res, message, errors = null, statusCode = 400) => {
  return res.status(statusCode).json({
    success: RESPONSE.ERROR,
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
