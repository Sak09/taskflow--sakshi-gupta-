'use strict';

class AppError extends Error {
  constructor(message, statusCode = 500, fields = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.fields = fields;
  }
}

module.exports = AppError;
