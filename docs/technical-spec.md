# Technical Specification

## 1. System Overview

This is a production-ready multi-tenant SaaS application that allows multiple organizations (tenants) to independently manage teams, projects, and tasks with strict data isolation.

The system enforces:

- Tenant-level isolation using tenant_id
- JWT-based authentication (24-hour expiry)
- Role-Based Access Control (RBAC)
- Subscription plan limits
- Audit logging for critical actions
- Docker-based containerized deployment

---

## 2. Tech Stack

Frontend:

- React
- Axios
- TailwindCSS

Backend:

- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcrypt

Database:

- PostgreSQL

Containerization:

- Docker
- Docker Compose

---

## 3. Database Schema

All tables except super admin records enforce tenant-level isolation.

---

## TABLE: tenants

- id (UUID, Primary Key)
- name (VARCHAR, NOT NULL)
- subdomain (VARCHAR, UNIQUE, NOT NULL)
- plan (ENUM: FREE, PRO, ENTERPRISE)
- max_users (INTEGER)
- max_projects (INTEGER)
- created_at (TIMESTAMP)

Purpose:
Stores organization-level data and subscription information.

---

## TABLE: users

- id (UUID, Primary Key)
- tenant_id (UUID, Foreign Key → tenants.id)
- name (VARCHAR, NOT NULL)
- email (VARCHAR, UNIQUE, NOT NULL)
- password_hash (TEXT, NOT NULL)
- role (ENUM: SUPER_ADMIN, TENANT_ADMIN, MEMBER)
- created_at (TIMESTAMP)

Isolation Rule:
All non-super-admin users must belong to a tenant.

---

## TABLE: projects

- id (UUID, Primary Key)
- tenant_id (UUID, Foreign Key → tenants.id)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- created_by (UUID → users.id)
- created_at (TIMESTAMP)

Isolation Rule:
Projects must always match the requesting user's tenant_id.

---

## TABLE: tasks

- id (UUID, Primary Key)
- tenant_id (UUID, Foreign Key → tenants.id)
- project_id (UUID → projects.id)
- title (VARCHAR, NOT NULL)
- description (TEXT)
- status (ENUM: TODO, IN_PROGRESS, DONE)
- assigned_to (UUID → users.id)
- due_date (DATE)
- created_at (TIMESTAMP)

Isolation Rule:
Task tenant_id must match project tenant_id.

---

## TABLE: audit_logs

- id (UUID, Primary Key)
- tenant_id (UUID, Foreign Key → tenants.id)
- user_id (UUID → users.id)
- action (VARCHAR)
- entity_type (VARCHAR) // PROJECT, TASK, USER, TENANT
- entity_id (UUID)
- timestamp (TIMESTAMP)
- metadata (JSONB)

Purpose:
Tracks sensitive operations such as:

- User creation
- Role changes
- Project creation/deletion
- Task updates
- Plan upgrades

Audit logs help ensure accountability and security compliance.
# Multi-Tenancy Enforcement
## 4. Tenant Identification

Tenant is identified using subdomain:

tenantA.app.com
tenantB.app.com

Flow:
1. Backend extracts subdomain.
2. Tenant is resolved from tenants table.
3. tenant_id is injected into request context.
4. All database queries include WHERE tenant_id = currentTenantId.
# Authentication & RBAC
## 5. Authentication

- JWT-based authentication
- Expiry: 24 hours
- Payload includes:
    - user_id
    - tenant_id
    - role

Passwords are hashed using bcrypt before storage.

---

## 6. Role-Based Access Control (RBAC)

Roles:

1. SUPER_ADMIN
   - Access to all tenants
   - Manage subscription plans
   - View system-wide data

2. TENANT_ADMIN
   - Manage users in tenant
   - Create/delete projects
   - Upgrade subscription

3. MEMBER
   - View assigned projects
   - Create/update tasks

Authorization is enforced using middleware that checks:
- JWT validity
- User role
- Tenant ownership
# Docker Configuration
## 7. Docker Deployment

Services:

- frontend
- backend
- postgres

Docker Compose handles:
- Container networking
- Environment variables
- Persistent volumes
- Port mapping

Environment Variables:
- DB_HOST
- DB_USER
- DB_PASSWORD
- JWT_SECRET
- NODE_ENV
# Subscription Enforcement
## 8. Subscription Plan Limits

Before creating:
- New user
- New project

System checks:

IF current_users >= max_users
    RETURN 403 Forbidden

IF current_projects >= max_projects
    RETURN 403 Forbidden

Plan types:

FREE:
- 5 users
- 3 projects

PRO:
- 20 users
- 15 projects

ENTERPRISE:
- Unlimited
