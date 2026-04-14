'use strict';

const { v4: uuidv4 } = require('uuid');
const ProjectModel = require('../models/project.model');
const AppError = require('../utils/AppError');

const ProjectService = {
  async create({ name, description, owner_id }) {
    return ProjectModel.create({ id: uuidv4(), name, description, owner_id });
  },

  async listAccessible(userId, pagination) {
    return ProjectModel.findAccessibleByUser(userId, pagination);
  },

  async getById(id) {
    const project = await ProjectModel.findById(id);
    if (!project) throw new AppError('not found', 404);
    return project;
  },

  async update(id, userId, data) {
    const project = await ProjectModel.findById(id);
    if (!project) throw new AppError('not found', 404);
    if (project.owner_id !== userId) throw new AppError('Forbidden', 403);
    return ProjectModel.update(id, data);
  },

  async delete(id, userId) {
    const project = await ProjectModel.findById(id);
    if (!project) throw new AppError('not found', 404);
    if (project.owner_id !== userId) throw new AppError('Forbidden', 403);
    await ProjectModel.delete(id);
  },

  async getStats(id) {
    const project = await ProjectModel.findById(id);
    if (!project) throw new AppError('not found', 404);
    return ProjectModel.getStats(id);
  },
};

module.exports = ProjectService;
