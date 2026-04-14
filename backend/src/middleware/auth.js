'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/app');
const { sendError } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized', 401);
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch {
    sendError(res, 'Unauthorized', 401);
  }
};

module.exports = { authenticate };
