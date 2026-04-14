'use strict';

require('dotenv/config');

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const password = await bcrypt.hash('Password123!', 12);
    const userId = uuidv4();
    const projectId = uuidv4();

    
    await client.query(
      `INSERT INTO users (id, name, email, password)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [userId, 'Demo User', 'demo@taskflow.dev', password]
    );

    const { rows: userRows } = await client.query(
      `SELECT id FROM users WHERE email = 'demo@taskflow.dev'`
    );
    const realUserId = userRows[0].id;

    await client.query(
      `INSERT INTO projects (id, name, description, owner_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [projectId, 'Demo Project', 'A sample project to demonstrate TaskFlow', realUserId]
    );

    const tasks = [
      { title: 'Set up CI/CD pipeline',     status: 'done',        priority: 'high'   },
      { title: 'Design database schema',     status: 'in_progress', priority: 'medium' },
      { title: 'Write API documentation',    status: 'todo',        priority: 'low'    },
    ];

    for (const task of tasks) {
      await client.query(
        `INSERT INTO tasks (id, title, status, priority, project_id, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [uuidv4(), task.title, task.status, task.priority, projectId, realUserId]
      );
    }

    await client.query('COMMIT');
    logger.info('Seed completed successfully');
    logger.info('   Email:    demo@taskflow.dev');
    logger.info('   Password: Password123!');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Seed failed', { error: err.message });
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
