# Multi-Tenant Project Management System

A backend system for managing tenants, users, projects, and tasks with multi-tenant support, JWT authentication, and audit logging.

---

## Features

- Multi-tenant architecture
- Tenant management (CRUD)
- User management (CRUD + activation/deactivation)
- Project management (CRUD)
- Task management (CRUD + status update)
- Authentication & JWT-based access control
- Audit logs for tracking actions

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **DB Access:** `pg` module

---

## Database Design

Tables:

- `tenants` – tenant info, subscription plan, limits
- `users` – user info, roles, linked to tenants
- `projects` – project info, linked to tenants & users
- `tasks` – task info, linked to projects & users
- `audit_logs` – logs of all important actions

---

## Setup & Run

1. Clone the repository:

```bash
git clone https://github.com/guravani-prasanna/saas-project
cd saas-project

2. Install dependencies:

cd backend
npm install
3. Setup environment variables in .env:
PORT=3000
DATABASE_URL=postgresql://username:postgres password:postgres @localhost:5432/dbname
JWT_SECRET=your_super_secret_key
```

4. Run database migrations:

psql -d dbname -f backend/db/init/001_schema.sql

5. Start the backend server:

node app.js

6. Backend runs at: http://localhost:3000
