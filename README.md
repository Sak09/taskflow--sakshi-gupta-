# TaskFlow — Project & Task Management

A full-stack collaborative task management application built with Node.js, Express, PostgreSQL, React, TypeScript, and MUI.

---

## 1. Overview

TaskFlow is a production-grade project and task management tool. Users can create projects, manage tasks with statuses and priorities, assign work to team members, and track progress through a clean kanban-style interface.

**Tech Stack:**
- **Backend:** Node.js + Express (TypeScript), PostgreSQL, `node-pg-migrate`, Winston logging, bcrypt + JWT auth
- **Frontend:** React 18 + TypeScript, MUI v5, React Query v5, Zustand, React Hook Form, React Router v6
- **Infrastructure:** Docker + Docker Compose, nginx (frontend), multi-stage Dockerfiles

---

## 2. Architecture Decisions

### Backend — MVC Structure
```
src/
├── controllers/   # HTTP layer — parse req, call service, send response
├── services/      # Business logic — auth, ownership checks
├── models/        # Data access — all SQL queries live here
├── routes/        # Express router definitions + middleware chains
├── middleware/    # auth, validation, error handling
├── validators/    # express-validator rules (co-located by domain)
├── config/        # DB pool, app config
└── utils/         # logger, response helpers, types
```

**Why this separation:** Controllers stay thin (no SQL, no business rules). Services own logic like "only the owner can delete a project." Models own all queries, making them easy to test and swap.

### Connection Pooling
PostgreSQL pool (max 20) via `pg`. All queries go through the pool — no per-request connections. Idle connections time out after 30s.

### Optimistic UI
Task status updates apply immediately in the UI (via React Query's `onMutate`), then revert on error. This makes the kanban feel instant.

### Pagination
All list endpoints support `?page=&limit=` with metadata returned in the response `meta` field. Frontend uses this for paginated project listings.

### What was intentionally left out
- WebSocket/SSE real-time updates (bonus feature — would add `socket.io` server-side, React context client-side)
- Drag-and-drop reordering (bonus — would add `@dnd-kit`)
- Dark mode (bonus — Zustand + MUI `colorScheme`)
- Email verification — not in spec, adds infra complexity
- Refresh tokens — JWT is 24h, acceptable for this scope

---

## 3. Running Locally

**Requirements:** Docker and Docker Compose only.

```bash
git clone https://github.com/your-name/taskflow
cd taskflow
cp .env.example .env
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000
- **Health check:** http://localhost:4000/health

Migrations run automatically on container start via `docker-entrypoint.sh`. Seed data is included in migration flow.

---

## 4. Running Migrations Manually

If you need to run migrations outside Docker:

```bash
cd backend
npm install
export DB_HOST=localhost DB_USER=taskflow DB_PASSWORD=taskflow_secret DB_NAME=taskflow DB_PORT=5432
npm run migrate:up
```

To roll back:
```bash
npm run migrate:down
```

To run seed data:
```bash
npm run seed
```

---

## 5. Test Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | `demo@taskflow.dev`    |
| Password | `Password123!`         |

The seed script creates this user, one demo project, and three tasks with different statuses.

---

## 6. API Reference

### Auth
| Method | Endpoint         | Auth | Description        |
|--------|-----------------|------|--------------------|
| POST   | /auth/register  | —    | Register user      |
| POST   | /auth/login     | —    | Login, get JWT     |

### Projects
| Method | Endpoint             | Auth | Description                        |
|--------|---------------------|------|------------------------------------|
| GET    | /projects           | ✓    | List accessible projects (paginated)|
| POST   | /projects           | ✓    | Create project                     |
| GET    | /projects/:id       | ✓    | Get project details                |
| PATCH  | /projects/:id       | ✓    | Update (owner only)                |
| DELETE | /projects/:id       | ✓    | Delete + cascade tasks (owner only)|
| GET    | /projects/:id/stats | ✓    | Task counts by status & assignee   |

### Tasks
| Method | Endpoint                  | Auth | Description                    |
|--------|--------------------------|------|--------------------------------|
| GET    | /projects/:id/tasks      | ✓    | List tasks (?status=&assignee=)|
| POST   | /projects/:id/tasks      | ✓    | Create task                    |
| PATCH  | /tasks/:id               | ✓    | Update task fields             |
| DELETE | /tasks/:id               | ✓    | Delete (owner or creator only) |

---

## 7. Running Tests

```bash
cd backend
npm install
npm test
```

Tests require a running PostgreSQL instance (configured via env vars). The test suite covers register, login, duplicate email, project CRUD, task CRUD, and auth guard checks.

---

## 8. Environment Variables

See `.env.example` for all variables. Key ones:

| Variable       | Default              | Description                     |
|----------------|---------------------|---------------------------------|
| DB_USER        | taskflow            | PostgreSQL username             |
| DB_PASSWORD    | taskflow_secret     | PostgreSQL password             |
| DB_NAME        | taskflow            | Database name                   |
| JWT_SECRET     | (change this!)      | Secret for signing JWTs         |
| BCRYPT_ROUNDS  | 12                  | bcrypt cost factor (≥ 12)       |
| VITE_API_URL   | http://localhost:4000| API base URL for frontend build |
