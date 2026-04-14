'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const http = require('http');
const app = require('./app');
const config = require('./config/app');
const logger = require('./utils/logger');
const { checkDbConnection, pool } = require('./config/database');
const { initializeDatabase } = require('./db/initDB');

const server = http.createServer(app);

async function start() {
  try {
    await initializeDatabase();
    
    // Check connection to the database
    await checkDbConnection();
    server.listen(config.port, () => {
      logger.info(`TaskFlow API running`, { port: config.port, env: config.nodeEnv });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    try {
      await pool.end();
      logger.info('DB pool closed. Goodbye.');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing DB pool', { error: err.message });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
  process.exit(1);
});

start();
