'use strict';

const { pool } = require('../config/database');

const UserModel = {
  async create({ id, name, email, password }) {
    const { rows } = await pool.query(
      `INSERT INTO users (id, name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, created_at`,
      [id, name, email, password]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT id, name, email, password, created_at FROM users WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, name, email, created_at FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async emailExists(email) {
    const { rows } = await pool.query(
      `SELECT 1 FROM users WHERE email = $1`,
      [email]
    );
    return rows.length > 0;
  },
};

module.exports = UserModel;
