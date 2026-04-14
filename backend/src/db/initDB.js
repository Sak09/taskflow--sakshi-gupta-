'use strict';

const { Pool } = require('pg');
const logger = require('../utils/logger');


async function initializeDatabase() {
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database
  });

  let client;
  try {
    client = await adminPool.connect();
    
    const dbName = process.env.DB_NAME || 'taskflow';
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1;
    `;
    
    const result = await client.query(checkDbQuery, [dbName]);
    
    if (result.rows.length === 0) {
      logger.info(`Creating database: ${dbName}`);
      
      if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
        throw new Error(`Invalid database name: ${dbName}`);
      }
      
      await client.query(`CREATE DATABASE "${dbName}";`);
      logger.info(`Database ${dbName} created successfully`);
    } else {
      logger.info(`Database ${dbName} already exists`);
    }
    
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await adminPool.end();
  }
}

module.exports = { initializeDatabase };
