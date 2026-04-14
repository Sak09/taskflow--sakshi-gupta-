'use strict';

const { pool } = require('../config/database');

const ALLOWED_UPDATE_FIELDS = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date'];

const TaskModel = {
  async create({ id, title, description = null, status = 'todo', priority = 'medium', project_id, assignee_id = null, due_date = null, creator_id }) {
    const { rows } = await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, creator_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, title, description, status, priority, project_id, assignee_id, due_date, creator_id]
    );
    return rows[0];
  },

  async findByProject(projectId, { status, assignee }, { page, limit }) {
    const conditions = ['t.project_id = $1'];
    const values = [projectId];
    let idx = 2;

    if (status) { conditions.push(`t.status = $${idx++}`); values.push(status); }
    if (assignee) { conditions.push(`t.assignee_id = $${idx++}`); values.push(assignee); }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT t.*,
              a.name AS assignee_name,
              c.name AS creator_name
       FROM tasks t
       LEFT JOIN users a ON a.id = t.assignee_id
       LEFT JOIN users c ON c.id = t.creator_id
       WHERE ${where}
       ORDER BY
         CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         t.due_date ASC NULLS LAST,
         t.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...values, limit, offset]
    );

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM tasks t WHERE ${where}`,
      values
    );

    const total = countRows[0].total;
    return {
      items: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT t.*, a.name AS assignee_name, c.name AS creator_name
       FROM tasks t
       LEFT JOIN users a ON a.id = t.assignee_id
       LEFT JOIN users c ON c.id = t.creator_id
       WHERE t.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in data) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key] ?? null);
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    return rowCount > 0;
  },
};

module.exports = TaskModel;
