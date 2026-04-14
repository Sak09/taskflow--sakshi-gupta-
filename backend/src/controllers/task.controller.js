'use strict';

const TaskService = require('../services/task.service');
const { sendSuccess } = require('../utils/response');

const getPagination = (query) => ({
  page: Math.max(1, parseInt(query.page) || 1),
  limit: Math.min(100, Math.max(1, parseInt(query.limit) || 50)),
});

const TaskController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const filters = {
        status: req.query.status || null,
        assignee: req.query.assignee || null,
      };
      const result = await TaskService.listByProject(
        req.params.id,
        filters,
        pagination
      );
      sendSuccess(res, result.items, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const task = await TaskService.create(
        req.params.id,
        req.user.user_id,
        req.body
      );
      sendSuccess(res, task, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const task = await TaskService.update(req.params.id, req.user.user_id, req.body);
      sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await TaskService.delete(req.params.id, req.user.user_id);
      sendSuccess(res, { message: 'Task deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TaskController;
