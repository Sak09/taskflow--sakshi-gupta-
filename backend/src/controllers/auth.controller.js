'use strict';

const AuthService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

const AuthController = {
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
