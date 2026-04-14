'use strict';

const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/database');

let authToken;
let projectId;
let taskId;

beforeAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '%@test.taskflow%'`);
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '%@test.taskflow%'`);
  await pool.end();
});


describe('POST /auth/register', () => {
  it('creates a new user and returns a JWT', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'test@test.taskflow',
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).not.toHaveProperty('password');
    authToken = res.body.data.token;
  });

  it('rejects duplicate email with 400 and field error', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'test@test.taskflow',
      password: 'Password123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('email');
  });

  it('rejects missing name with 400', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'noname@test.taskflow',
      password: 'Password123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('name');
  });
});

describe('POST /auth/login', () => {
  it('returns JWT on valid credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'test@test.taskflow',
      password: 'Password123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'test@test.taskflow',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'nobody@test.taskflow',
      password: 'Password123!',
    });
    expect(res.status).toBe(401);
  });
});


describe('Projects API', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/projects');
    expect(res.status).toBe(401);
  });

  it('POST /projects — creates a project', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Project', description: 'Integration test project' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    projectId = res.body.data.id;
  });

  it('GET /projects — lists accessible projects with pagination meta', async () => {
    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('GET /projects/:id — returns the project', async () => {
    const res = await request(app)
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(projectId);
  });

  it('GET /projects/:id — returns 404 for unknown id', async () => {
    const res = await request(app)
      .get('/projects/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /projects/:id — updates name', async () => {
    const res = await request(app)
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Project Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Project Name');
  });

  it('GET /projects/:id/stats — returns task counts', async () => {
    const res = await request(app)
      .get(`/projects/${projectId}/stats`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('by_status');
    expect(res.body.data).toHaveProperty('by_assignee');
  });
});


describe('Tasks API', () => {
  it('POST /projects/:id/tasks — creates a task', async () => {
    const res = await request(app)
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Task', priority: 'high', status: 'todo' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    taskId = res.body.data.id;
  });

  it('POST /projects/:id/tasks — rejects missing title', async () => {
    const res = await request(app)
      .post(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ priority: 'high' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('title');
  });

  it('GET /projects/:id/tasks — lists tasks', async () => {
    const res = await request(app)
      .get(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /projects/:id/tasks?status=todo — filters by status', async () => {
    const res = await request(app)
      .get(`/projects/${projectId}/tasks?status=todo`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => expect(t.status).toBe('todo'));
  });

  it('PATCH /tasks/:id — updates task status optimistically', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('PATCH /tasks/:id — rejects invalid status', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'flying' });
    expect(res.status).toBe(400);
  });

  it('DELETE /tasks/:id — deletes the task', async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /projects/:id — deletes project and cascades', async () => {
    const res = await request(app)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });
});
