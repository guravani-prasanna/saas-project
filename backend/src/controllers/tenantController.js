// backend/src/controllers/tenantController.js
const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const getTenantDetails = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    // If not super_admin, tenantIsolation already ensured same tenant
    const result = await pool.query(
      `SELECT t.id, t.name, t.subdomain, t.status, t.subscription_plan,
              t.max_users, t.max_projects, t.created_at
       FROM tenants t
       WHERE t.id = $1`,
      [tenantId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found', data: null });
    }

    const tenant = result.rows[0];

    const statsRes = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM users u WHERE u.tenant_id = $1) AS total_users,
         (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = $1) AS total_projects,
         (SELECT COUNT(*) FROM tasks tk WHERE tk.tenant_id = $1) AS total_tasks`,
      [tenantId],
    );
    const stats = statsRes.rows[0];

    return res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(stats.total_users),
          totalProjects: Number(stats.total_projects),
          totalTasks: Number(stats.total_tasks),
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
    const role = req.user.role;

    // Tenant admins can only update name
    const updates = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }

    if (role === 'super_admin') {
      if (status !== undefined) {
        updates.push(`status = $${idx++}`);
        values.push(status);
      }
      if (subscriptionPlan !== undefined) {
        updates.push(`subscription_plan = $${idx++}`);
        values.push(subscriptionPlan);
      }
      if (maxUsers !== undefined) {
        updates.push(`max_users = $${idx++}`);
        values.push(maxUsers);
      }
      if (maxProjects !== undefined) {
        updates.push(`max_projects = $${idx++}`);
        values.push(maxProjects);
      }
    } else {
      // tenant_admin trying to update restricted fields
      if (status || subscriptionPlan || maxUsers || maxProjects) {
        return res
          .status(403)
          .json({ success: false, message: 'Not allowed to update plan fields', data: null });
      }
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'Nothing to update',
        data: { id: tenantId },
      });
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE tenants
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, name, updated_at
    `;
    values.push(tenantId);

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found', data: null });
    }

    const updated = result.rows[0];

    await logAudit({
      tenantId,
      userId: req.user.id,
      action: 'UPDATE_TENANT',
      entityType: 'tenant',
      entityId: tenantId,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const listTenants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const offset = (page - 1) * limit;
    const { status, subscriptionPlan } = req.query;

    const filters = [];
    const values = [];
    let idx = 1;

    if (status) {
      filters.push(`status = $${idx++}`);
      values.push(status);
    }
    if (subscriptionPlan) {
      filters.push(`subscription_plan = $${idx++}`);
      values.push(subscriptionPlan);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const listQuery = `
      SELECT id, name, subdomain, status, subscription_plan, created_at
      FROM tenants
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM tenants
      ${whereClause}
    `;

    const [listRes, countRes] = await Promise.all([
      pool.query(listQuery, values),
      pool.query(countQuery, values),
    ]);

    const totalTenants = Number(countRes.rows[0].total);
    const totalPages = Math.ceil(totalTenants / limit);

    // Stats per tenant: optional, but spec requests totalUsers and totalProjects
    const tenants = await Promise.all(
      listRes.rows.map(async (t) => {
        const statsRes = await pool.query(
          `SELECT
             (SELECT COUNT(*) FROM users u WHERE u.tenant_id = $1) AS total_users,
             (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = $1) AS total_projects`,
          [t.id],
        );
        const stats = statsRes.rows[0];

        return {
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscription_plan,
          totalUsers: Number(stats.total_users),
          totalProjects: Number(stats.total_projects),
          createdAt: t.created_at,
        };
      }),
    );

    return res.json({
      success: true,
      data: {
        tenants,
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getTenantDetails, updateTenant, listTenants };
