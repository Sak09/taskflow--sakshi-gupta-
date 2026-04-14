'use strict';

const { body } = require('express-validator');

const createProjectValidator = [
  body('name').trim().notEmpty().withMessage('is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
];

const updateProjectValidator = [
  body('name').optional().trim().notEmpty().withMessage('cannot be empty').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
];

module.exports = { createProjectValidator, updateProjectValidator };
