const pool = require('../config/db');
const { hashPassword } = require('../utils/hash');
const { checkUserLimit } = require('../utils/subscriptionLimits');
const { logAudit } = require('../utils/auditLogger');

const addUserToTenant = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { tenantId } = req.params;
    const { email, password, fullName, role = 'user' } = req.body;
    const currentUser = req.user;

    await client.query('BEGIN');

    // Check subscription limit
    const limitCheck = await checkUserLimit(tenantId, client);
    if (!limitCheck.canAdd) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: `Subscription limit reached (${limitCheck.current}/${limitCheck.max} users)`,
        data: null
      });
    }

    // Check email uniqueness within tenant
    const emailCheck = await client.query(
      'SELECT 1 FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, email]
    );
    if (emailCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant',
        data: null
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, TRUE)
       RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
      [tenantId, email, passwordHash, fullName, role]
    );

    await client.query('COMMIT');

    const newUser = result.rows[0];

    // Log audit
    await logAudit({
      tenantId,
      userId: currentUser.id,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: newUser.id,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        tenantId: newUser.tenant_id,
        isActive: newUser.is_active,
        createdAt: newUser.created_at
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
};

const listTenantUsers = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { search, role, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE tenant_id = $1
    `;
    const values = [tenantId];
    let paramCount = 2;

    // Apply filters
    if (search) {
      query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND role = $${paramCount}`;
      values.push(role);
      paramCount++;
    }

    // Count total
    const countQuery = query.replace('SELECT id, email, full_name, role, is_active, created_at', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and ordering
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);

    return res.json({
      success: true,
      data: {
        users: result.rows.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          isActive: user.is_active,
          createdAt: user.created_at
        })),
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (err) {
    return next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, role, isActive } = req.body;
    const currentUser = req.user;

    // Verify user exists and belongs to same tenant
    const userCheck = await pool.query(
      'SELECT id, tenant_id, role FROM users WHERE id = $1',
      [userId]
    );
    if (userCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    const targetUser = userCheck.rows[0];

    // Authorization logic
    const isSelf = currentUser.id === userId;
    const isTenantAdmin = currentUser.role === 'tenant_admin';
    const isSameTenant = currentUser.tenantId === targetUser.tenant_id;
    const isSuperAdmin = currentUser.role === 'super_admin';

    // Users can only update their own fullName
    if (isSelf) {
      if (role !== undefined || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Cannot update role or status for yourself',
          data: null
        });
      }
    }
    // Tenant admins can update users in their tenant
    else if (isTenantAdmin && isSameTenant) {
      // Tenant admins cannot change role to super_admin
      if (role === 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Tenant admin cannot assign super_admin role',
          data: null
        });
      }
    }
    // Super admins can update anyone
    else if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
        data: null
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }

    if (role !== undefined && !isSelf) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (isActive !== undefined && !isSelf) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'Nothing to update',
        data: null
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, full_name, role, updated_at
    `;

    const result = await pool.query(query, values);
    const updatedUser = result.rows[0];

    // Log audit
    await logAudit({
      tenantId: targetUser.tenant_id,
      userId: currentUser.id,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: userId,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        updatedAt: updatedUser.updated_at
      }
    });
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Cannot delete yourself
    if (currentUser.id === userId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete yourself',
        data: null
      });
    }

    await client.query('BEGIN');

    // Get user info
    const userInfo = await client.query(
      'SELECT id, tenant_id FROM users WHERE id = $1',
      [userId]
    );
    if (userInfo.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    const targetUser = userInfo.rows[0];

    // Verify authorization
    if (currentUser.role !== 'super_admin' && currentUser.tenantId !== targetUser.tenant_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user',
        data: null
      });
    }

    // Set assigned_to to NULL for tasks before deleting
    await client.query(
      'UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1 AND tenant_id = $2',
      [userId, targetUser.tenant_id]
    );

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    // Log audit
    await logAudit({
      tenantId: targetUser.tenant_id,
      userId: currentUser.id,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: userId,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'User deleted successfully',
      data: null
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
};

module.exports = { addUserToTenant, listTenantUsers, updateUser, deleteUser };