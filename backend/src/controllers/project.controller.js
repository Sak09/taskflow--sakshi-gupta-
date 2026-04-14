'use strict';

const ProjectService = require('../services/project.service');
const { sendSuccess } = require('../utils/response');

const getPagination = (query) => ({
  page: Math.max(1, parseInt(query.page) || 1),
  limit: Math.min(100, Math.max(1, parseInt(query.limit) || 20)),
});

const ProjectController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const result = await ProjectService.listAccessible(req.user.user_id, pagination);
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
      const project = await ProjectService.create({
        ...req.body,
        owner_id: req.user.user_id,
      });
      sendSuccess(res, project, 201);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const project = await ProjectService.getById(req.params.id);
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const project = await ProjectService.update(req.params.id, req.user.user_id, req.body);
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await ProjectService.delete(req.params.id, req.user.user_id);
      sendSuccess(res, { message: 'Project deleted' });
    } catch (err) {
      next(err);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await ProjectService.getStats(req.params.id);
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProjectController;
