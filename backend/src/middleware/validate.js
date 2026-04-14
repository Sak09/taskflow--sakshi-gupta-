'use strict';

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fields = {};
    errors.array().forEach((err) => {
      if (err.path) fields[err.path] = err.msg;
    });
    return res.status(400).json({ error: 'validation failed', fields });
  }
  next();
};

module.exports = { validate };
