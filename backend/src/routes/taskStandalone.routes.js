'use strict';

const { Router } = require('express');
const TaskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const { updateTaskValidator } = require('../validators/task.validator');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.patch('/:id', updateTaskValidator, validate, TaskController.update);
router.delete('/:id', TaskController.delete);

module.exports = router;
