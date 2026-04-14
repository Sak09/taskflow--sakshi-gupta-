'use strict';

const { Router } = require('express');
const ProjectController = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth');
const { createProjectValidator, updateProjectValidator } = require('../validators/project.validator');
const { validate } = require('../middleware/validate');
const taskRoutes = require('./task.routes');

const router = Router();

router.use(authenticate);

router.get('/', ProjectController.list);
router.post('/', createProjectValidator, validate, ProjectController.create);
router.get('/:id', ProjectController.getById);
router.patch('/:id', updateProjectValidator, validate, ProjectController.update);
router.delete('/:id', ProjectController.delete);
router.get('/:id/stats', ProjectController.getStats);

router.use('/:id/tasks', taskRoutes);

module.exports = router;
