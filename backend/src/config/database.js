'use strict';

const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taskflow',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle DB client', { error: err.message });
});

pool.on('connect', () => {
  logger.debug('New DB connection established');
});

async function checkDbConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('Database connection verified');
  } finally {
    client.release();
  }
}

module.exports = { pool, checkDbConnection };
