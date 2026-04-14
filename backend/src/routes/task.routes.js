'use strict';

const { Router } = require('express');
const TaskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const { createTaskValidator } = require('../validators/task.validator');
const { validate } = require('../middleware/validate');

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', TaskController.list);
router.post('/', createTaskValidator, validate, TaskController.create);

module.exports = router;
