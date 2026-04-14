'use strict';

const { v4: uuidv4 } = require('uuid');
const TaskModel = require('../models/task.model');
const ProjectModel = require('../models/project.model');
const AppError = require('../utils/AppError');

const TaskService = {
  async create(projectId, userId, data) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError('not found', 404);

    return TaskModel.create({
      id: uuidv4(),
      project_id: projectId,
      creator_id: userId,
      ...data,
    });
  },

  async listByProject(projectId, filters, pagination) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError('not found', 404);
    return TaskModel.findByProject(projectId, filters, pagination);
  },

  async update(taskId, userId, data) {
    const task = await TaskModel.findById(taskId);
    if (!task) throw new AppError('not found', 404);
    return TaskModel.update(taskId, data);
  },

  async delete(taskId, userId) {
    const task = await TaskModel.findById(taskId);
    if (!task) throw new AppError('not found', 404);

    const project = await ProjectModel.findById(task.project_id);
    const isOwner = project && project.owner_id === userId;
    const isCreator = task.creator_id === userId;

    if (!isOwner && !isCreator) throw new AppError('Forbidden', 403);
    await TaskModel.delete(taskId);
  },
};

module.exports = TaskService;
