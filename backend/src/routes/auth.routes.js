'use strict';

const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validate');

const router = Router();

router.post('/register', registerValidator, validate, AuthController.register);
router.post('/login', loginValidator, validate, AuthController.login);

module.exports = router;
