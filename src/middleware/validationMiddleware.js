const { validationResult } = require('express-validator');
const { errorResponse } = require('../helpers/responseHelper');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return errorResponse(res, 'Validation failed', formattedErrors, 400);
  }

  next();
};

module.exports = { validateRequest };
