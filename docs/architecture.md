# System Architecture Document

## 1. Architecture Overview

The system follows a multi-tenant three-tier architecture:

1. Presentation Layer (Frontend)
2. Application Layer (Backend API)
3. Data Layer (PostgreSQL)

---

## 2. High-Level Architecture

Client (Browser)
|
v
Subdomain Routing (Nginx)
|
v
Frontend (React)
|
v
Backend API (Node.js + Express)
|
v
PostgreSQL Database (Shared Schema)

---

## 3. Multi-Tenancy Enforcement

- Tenant identified from subdomain
- Middleware resolves tenant
- tenant_id injected into request context
- All DB queries filtered by tenant_id

---

## 4. Authentication Flow

1. User logs in via tenant subdomain
2. Backend validates credentials
3. JWT issued with:
   - user_id
   - tenant_id
   - role
   - 24h expiry
4. Token verified in protected routes

---

## 5. RBAC Middleware

Middleware checks:

- Role from JWT
- Endpoint permissions
- Tenant match validation

---

## 6. Subscription Enforcement

Before:

- Creating users
- Creating projects

System checks:

- Plan limits
- Active subscription status

---

## 7. Deployment Architecture

Docker Containers:

- frontend container
- backend container
- postgres container

Managed via Docker Compose.

Environment variables used for:

- DB credentials
- JWT secret
- Domain configuration

---

## 8. Scalability Strategy

- Stateless backend
- Horizontal scaling possible
- Load balancer support
- Indexed tenant_id for performance
