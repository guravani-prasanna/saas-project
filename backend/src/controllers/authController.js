// backend/src/controllers/authController.js
const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const { getPlanLimits } = require('../utils/subscriptionLimits');
const { logAudit } = require('../utils/auditLogger');

const registerTenant = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    await client.query('BEGIN');

    // Check uniqueness of subdomain and email in tenants/users
    const subdomainCheck = await client.query(
      'SELECT 1 FROM tenants WHERE subdomain = $1',
      [subdomain],
    );
    if (subdomainCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Subdomain already exists', data: null });
    }

    const emailCheck = await client.query(
      'SELECT 1 FROM users WHERE email = $1 AND tenant_id IS NOT NULL',
      [adminEmail],
    );
    if (emailCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Admin email already exists', data: null });
    }

    const tenantId = 'uuid_generate_v4()'; // if extension enabled; or use gen_random_uuid()
    const plan = 'free';
    const limits = getPlanLimits(plan);

    const tenantInsert = await client.query(
      `INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES (uuid_generate_v4(), $1, $2, 'active', $3, $4, $5)
       RETURNING id, subdomain`,
      [tenantName, subdomain, plan, limits.maxUsers, limits.maxProjects],
    );
    const createdTenant = tenantInsert.rows[0];

    const passwordHash = await hashPassword(adminPassword);

    const adminInsert = await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'tenant_admin', TRUE)
       RETURNING id, email, full_name, role`,
      [createdTenant.id, adminEmail, passwordHash, adminFullName],
    );
    const adminUser = adminInsert.rows[0];

    await client.query('COMMIT');

    await logAudit({
      tenantId: createdTenant.id,
      userId: adminUser.id,
      action: 'REGISTER_TENANT',
      entityType: 'tenant',
      entityId: createdTenant.id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: createdTenant.id,
        subdomain: createdTenant.subdomain,
        adminUser,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, tenantSubdomain, tenantId } = req.body;

    let tenant;
    if (tenantSubdomain) {
      const result = await pool.query(
        'SELECT * FROM tenants WHERE subdomain = $1',
        [tenantSubdomain],
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Tenant not found', data: null });
      }
      tenant = result.rows[0];
    } else if (tenantId) {
      const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Tenant not found', data: null });
      }
      tenant = result.rows[0];
    } else {
      return res.status(400).json({ success: false, message: 'tenantSubdomain or tenantId is required', data: null });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Tenant is not active', data: null });
    }

    // Special case: super_admin may not be tied to a tenant
    const userResult = await pool.query(
      `SELECT * FROM users
       WHERE email = $1
         AND ( (tenant_id = $2 AND role != 'super_admin') OR (tenant_id IS NULL AND role = 'super_admin') )`,
      [email, tenant.id],
    );
    if (userResult.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }
    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account inactive', data: null });
    }

    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const payload = {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    };

    const token = signToken(payload, '24h');

    await logAudit({
      tenantId: user.tenant_id,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 24 * 60 * 60,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const { id, tenantId } = req.user;

    const userResult = await pool.query(
      'SELECT id, email, full_name, role, is_active, tenant_id FROM users WHERE id = $1',
      [id],
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    const user = userResult.rows[0];
    let tenant = null;

    if (tenantId) {
      const tenantResult = await pool.query(
        'SELECT id, name, subdomain, subscription_plan, max_users, max_projects FROM tenants WHERE id = $1',
        [tenantId],
      );
      tenant = tenantResult.rowCount > 0 ? tenantResult.rows[0] : null;
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        tenant: tenant
          ? {
              id: tenant.id,
              name: tenant.name,
              subdomain: tenant.subdomain,
              subscriptionPlan: tenant.subscription_plan,
              maxUsers: tenant.max_users,
              maxProjects: tenant.max_projects,
            }
          : null,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    // If using sessions table, delete session here.
    await logAudit({
      tenantId: req.user.tenantId,
      userId: req.user.id,
      action: 'LOGOUT',
      entityType: 'user',
      entityId: req.user.id,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Logged out successfully', data: null });
  } catch (err) {
    return next(err);
  }
};

module.exports = { registerTenant, login, me, logout };
