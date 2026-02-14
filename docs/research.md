# Research Document

## 1. Problem Statement

Modern SaaS platforms must support multiple organizations (tenants) within a single system while ensuring complete data isolation, strong security, and scalability.

The objective of this project is to design and implement a production-ready, multi-tenant SaaS application where:

- Multiple organizations can register independently
- Each tenant manages its own users, projects, and tasks
- Data is strictly isolated between tenants
- Role-Based Access Control (RBAC) is enforced
- Subscription plans restrict feature usage
- The system is containerized using Docker

The core technical challenge is implementing secure multi-tenancy without compromising scalability or performance.

---

## 2. Multi-Tenancy Architecture Research

### 2.1 Approaches Evaluated

#### Option 1: Separate Database per Tenant

Each tenant has its own dedicated database.

Pros:

- Strong isolation
- Easy compliance

Cons:

- Expensive at scale
- Hard to manage migrations
- Complex infrastructure

Decision: Not chosen.

---

#### Option 2: Separate Schema per Tenant

Single database, separate schema for each tenant.

Pros:

- Better isolation than shared schema
- Easier backup per tenant

Cons:

- Schema management complexity
- Hard to scale to thousands of tenants

Decision: Not chosen.

---

#### Option 3: Shared Database, Shared Schema with tenant_id (Chosen)

All tenants share the same tables.
Every record includes a tenant_id column.

Pros:

- Highly scalable
- Cost-effective
- Easier to manage
- Works well with containerized deployment

Cons:

- Requires strict query filtering
- Risk of data leakage if not enforced properly

Final Decision:
Shared database + shared schema with strict tenant_id enforcement.

All tables except system-level super admin records include:

tenant_id UUID NOT NULL

All queries must include:

WHERE tenant_id = currentTenantId

---

## 3. Tenant Identification Research

Three approaches were evaluated:

1. URL Path (app.com/tenantA)
2. Request Header-based identification
3. Subdomain-based identification

Final Decision: Subdomain-Based Identification

Example:
tenantA.app.com
tenantB.app.com

Reason:

- Industry standard in SaaS
- Clean tenant separation
- Better UX
- Easier branding
- Clear tenant resolution before authentication

Flow:

1. Backend extracts subdomain.
2. Tenant is resolved from tenants table.
3. tenant_id is injected into request context.
4. All database queries are filtered using this tenant_id.

---

## 4. Authentication Research

The system requires secure, stateless authentication.

### Options Evaluated:

1. Session-based authentication
2. JWT-based authentication

Final Decision: JWT (JSON Web Token)

Reasons:

- Stateless (scales horizontally)
- Works well in containerized environments
- Suitable for REST APIs
- Supports role embedding

JWT Configuration:

- Expiry: 24 hours
- Payload contains:
  - user_id
  - tenant_id
  - role

Passwords are securely hashed using bcrypt before storage.

---

## 5. Authorization (RBAC) Research

The application requires role-based access control to restrict operations.

Roles Defined:

1. SUPER_ADMIN
   - System-wide access
   - Manage tenants
   - View all data

2. TENANT_ADMIN
   - Manage users within tenant
   - Create/delete projects
   - View audit logs
   - Upgrade subscription

3. MEMBER
   - Manage assigned tasks
   - View tenant projects

Authorization Strategy:

- Middleware validates JWT
- Middleware checks role
- Middleware verifies tenant ownership

---

## 6. Subscription Plan Enforcement Research

To support SaaS monetization, subscription plans are implemented.

Plans:

FREE:

- Limited users
- Limited projects

PRO:

- Increased limits

ENTERPRISE:

- Unlimited usage

Plan limits enforced before:

- Creating users
- Creating projects

If limits exceeded:
System returns 403 Forbidden.

This ensures business logic is enforced at the backend layer.

---

## 7. Audit Logging Research

To support accountability and security monitoring, an audit_logs table is implemented.

Purpose:

- Track sensitive actions
- Maintain compliance
- Enable activity monitoring

Actions logged:

- User creation
- Role updates
- Project creation/deletion
- Task updates
- Subscription upgrades

Each log contains:

- tenant_id
- user_id
- action
- entity_type
- entity_id
- timestamp
- metadata (JSON)

Audit logging improves traceability and production readiness.

---

## 8. Security Considerations

To prevent tenant data leakage:

- Mandatory tenant_id column in all tenant-level tables
- Tenant resolution before authentication
- Parameterized SQL queries
- JWT validation middleware
- Role validation middleware
- HTTPS in production
- Centralized error handling

Indexing Strategy:

- Index on tenant_id for performance
- Index on foreign keys
- Unique index on subdomain

---

## 9. Scalability & Deployment Research

To ensure production readiness:

- Stateless backend design
- Docker containerization
- Separate containers for frontend, backend, and database
- Environment variable configuration
- Horizontal scaling support
- Load balancer compatibility

Docker enables:

- Consistent development and production environments
- Easy deployment
- Service isolation

---

## 10. Risks & Mitigation

Risk: Cross-Tenant Data Leakage  
Mitigation:

- Strict tenant_id filtering
- Middleware injection of tenant context
- Code reviews for query safety

Risk: Performance degradation  
Mitigation:

- Indexed tenant_id
- Optimized queries
- Connection pooling

Risk: Unauthorized access  
Mitigation:

- JWT validation
- RBAC middleware
- Password hashing

---

## 11. Conclusion

The final architecture uses:

- Shared database with strict tenant_id isolation
- Subdomain-based tenant identification
- JWT-based authentication (24-hour expiry)
- Role-Based Access Control (RBAC)
- Subscription enforcement logic
- Audit logging
- Docker containerization

This design ensures scalability, security, maintainability, and production readiness for a modern multi-tenant SaaS platform.
