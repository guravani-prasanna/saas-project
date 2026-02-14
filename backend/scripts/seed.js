// backend/scripts/seed.js
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) AS count FROM users");
    if (Number(rows[0].count) > 0) {
      console.log('Seed data already present, skipping.');
      process.exit(0);
    }

    const passwordSuper = await bcrypt.hash('Admin@123', 10);
    const passwordTenantAdmin = await bcrypt.hash('TenantAdmin@123', 10);
    const passwordUser = await bcrypt.hash('User@123', 10);

    // Super admin (tenant_id NULL)
    const superAdmin = await pool.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES (gen_random_uuid(), NULL, 'superadmin@system.com', $1, 'System Super Admin', 'super_admin', TRUE)
       RETURNING id`,
      [passwordSuper],
    );

    // Tenant
    const tenant = await pool.query(
      `INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES (gen_random_uuid(), 'Demo Tenant', 'demo', 'active', 'free', 10, 10)
       RETURNING id`,
    );
    const tenantId = tenant.rows[0].id;

    // Tenant admin
    const tenantAdmin = await pool.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES (gen_random_uuid(), $1, 'admin@demo.com', $2, 'Demo Admin', 'tenant_admin', TRUE)
       RETURNING id`,
      [tenantId, passwordTenantAdmin],
    );
    const tenantAdminId = tenantAdmin.rows[0].id;

    // Regular user
    const regularUser = await pool.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES (gen_random_uuid(), $1, 'user@demo.com', $2, 'Demo User', 'user', TRUE)
       RETURNING id`,
      [tenantId, passwordUser],
    );
    const regularUserId = regularUser.rows[0].id;

    // Project
    const project = await pool.query(
      `INSERT INTO projects (id, tenant_id, name, description, status, created_by)
       VALUES (gen_random_uuid(), $1, 'Sample Project', 'Initial seeded project', 'active', $2)
       RETURNING id`,
      [tenantId, tenantAdminId],
    );
    const projectId = project.rows[0].id;

    // Tasks
    await pool.query(
      `INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
       VALUES
       (gen_random_uuid(), $1, $2, 'Seeded Task 1', 'First task', 'todo', 'high', $3, CURRENT_DATE + INTERVAL '7 days'),
       (gen_random_uuid(), $1, $2, 'Seeded Task 2', 'Second task', 'in_progress', 'medium', $4, CURRENT_DATE + INTERVAL '10 days')`,
      [projectId, tenantId, tenantAdminId, regularUserId],
    );

    console.log('Seed data inserted.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();
