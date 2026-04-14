'use strict';

const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    const body = { error: err.message };
    if (err.fields) body.fields = err.fields;
    return res.status(err.statusCode).json(body);
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ error: 'Internal server error' });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'not found' });
};

module.exports = { errorHandler, notFoundHandler };
