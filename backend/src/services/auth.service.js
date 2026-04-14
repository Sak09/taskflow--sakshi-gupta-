'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/user.model');
const config = require('../config/app');
const AppError = require('../utils/AppError');

const AuthService = {
  async register({ name, email, password }) {
    const exists = await UserModel.emailExists(email);
    if (exists) {
      throw new AppError('validation failed', 400, { email: 'already in use' });
    }

    const hashed = await bcrypt.hash(password, config.bcrypt.rounds);
    const user = await UserModel.create({ id: uuidv4(), name, email, password: hashed });
    const token = AuthService._generateToken(user);
    return { user, token };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const { password: _pwd, ...safeUser } = user;
    const token = AuthService._generateToken(safeUser);
    return { user: safeUser, token };
  },

  _generateToken(user) {
    return jwt.sign(
      { user_id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  },
};

module.exports = AuthService;
