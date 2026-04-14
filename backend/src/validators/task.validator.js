'use strict';

const { body } = require('express-validator');

const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('is required').isLength({ max: 300 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('must be todo, in_progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('must be low, medium, or high'),
  body('assignee_id').optional({ nullable: true }).isUUID().withMessage('must be a valid UUID'),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('must be a valid date'),
];

const updateTaskValidator = [
  body('title').optional().trim().notEmpty().withMessage('cannot be empty').isLength({ max: 300 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 2000 }),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('must be todo, in_progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('must be low, medium, or high'),
  body('assignee_id').optional({ nullable: true }).isUUID().withMessage('must be a valid UUID'),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('must be a valid date'),
];

module.exports = { createTaskValidator, updateTaskValidator };
