-- Insert super_admin (tenant_id = NULL)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  NULL,
  'superadmin@system.com',
  '$2b$10$H9.123456789012345678901234567890123456789012345678901234567890', -- bcrypt hash of "Admin@123"
  'Super Admin',
  'super_admin',
  TRUE
);

-- Insert tenant (demo company)
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  'Demo Company',
  'demo',
  'active',
  'pro',
  25,
  15
);

-- Insert tenant_admin for demo tenant
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'admin@demo.com',
  '$2b$10$H9.123456789012345678901234567890123456789012345678901234567890', -- bcrypt hash of "Demo@123"
  'Tenant Admin',
  'tenant_admin',
  TRUE
);

-- Insert regular users for demo tenant
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'user1@demo.com',
    '$2b$10$H9.123456789012345678901234567890123456789012345678901234567890', -- bcrypt hash of "User@123"
    'User One',
    'user',
    TRUE
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'user2@demo.com',
    '$2b$10$H9.123456789012345678901234567890123456789012345678901234567890', -- bcrypt hash of "User@123"
    'User Two',
    'user',
    TRUE
  );

-- Insert projects for demo tenant
INSERT INTO projects (id, tenant_id, name, description, status, created_by)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Project Alpha',
    'First demo project',
    'active',
    '30000000-0000-0000-0000-000000000001'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Project Beta',
    'Second demo project',
    'active',
    '30000000-0000-0000-0000-000000000001'
  );

-- Insert tasks for projects
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Design homepage mockup',
    'Create high-fidelity design',
    'todo',
    'high',
    '40000000-0000-0000-0000-000000000001',
    '2025-12-31'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Implement login API',
    'Build JWT auth endpoints',
    'in_progress',
    'medium',
    '30000000-0000-0000-0000-000000000001',
    '2025-12-30'
  );
