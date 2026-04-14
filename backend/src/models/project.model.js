'use strict';

const { pool } = require('../config/database');

const ProjectModel = {
  async create({ id, name, description = null, owner_id }) {
    const { rows } = await pool.query(
      `INSERT INTO projects (id, name, description, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name, description, owner_id]
    );
    return rows[0];
  },

  async findAccessibleByUser(userId, { page, limit }) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT p.*, u.name AS owner_name,
              COUNT(t.id)::int AS task_count
       FROM projects p
       JOIN users u ON u.id = p.owner_id
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.owner_id = $1
          OR EXISTS (SELECT 1 FROM tasks WHERE project_id = p.id AND assignee_id = $1)
       GROUP BY p.id, u.name
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(DISTINCT p.id)::int AS total
       FROM projects p
       WHERE p.owner_id = $1
          OR EXISTS (SELECT 1 FROM tasks WHERE project_id = p.id AND assignee_id = $1)`,
      [userId]
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
      `SELECT p.*, u.name AS owner_name
       FROM projects p
       JOIN users u ON u.id = p.owner_id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }

    if (fields.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
    return rowCount > 0;
  },

  async getStats(projectId) {
    const { rows: statusRows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM tasks WHERE project_id = $1 GROUP BY status`,
      [projectId]
    );

    const { rows: assigneeRows } = await pool.query(
      `SELECT t.assignee_id, u.name AS assignee_name, COUNT(*)::int AS count
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = $1 AND t.assignee_id IS NOT NULL
       GROUP BY t.assignee_id, u.name`,
      [projectId]
    );

    const by_status = { todo: 0, in_progress: 0, done: 0 };
    statusRows.forEach((r) => { by_status[r.status] = r.count; });

    return { by_status, by_assignee: assigneeRows };
  },
};

module.exports = ProjectModel;
