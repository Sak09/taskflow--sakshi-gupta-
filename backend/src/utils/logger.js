'use strict';

const winston = require('winston');
const { NODE_ENV } = process.env;

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

module.exports = logger;
