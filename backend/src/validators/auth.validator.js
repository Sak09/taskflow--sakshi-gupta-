'use strict';

const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('must be a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('must be at least 8 characters'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('is required'),
];

module.exports = { registerValidator, loginValidator };
