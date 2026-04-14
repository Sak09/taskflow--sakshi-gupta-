'use strict';

require('dotenv/config');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/app');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskStandaloneRoutes = require('./routes/taskStandalone.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: '10kb' }));
app.use(compression());

app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));


app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskStandaloneRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
