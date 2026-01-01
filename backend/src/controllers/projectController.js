const pool = require('../config/db');
const { checkProjectLimit } = require('../utils/subscriptionLimits');
const { logAudit } = require('../utils/auditLogger');

const createProject = async (req, res, next) => {
  try {
    const { name, description, status = 'active' } = req.body;
    const { tenantId, id: userId } = req.user;

    // Check subscription limit
    const limitCheck = await checkProjectLimit(tenantId, pool);
    if (!limitCheck.canAdd) {
      return res.status(403).json({
        success: false,
        message: `Project limit reached (${limitCheck.current}/${limitCheck.max} projects)`,
        data: null
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (id, tenant_id, name, description, status, created_by)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING id, tenant_id, name, description, status, created_by, created_at`,
      [tenantId, name, description, status, userId]
    );

    const project = result.rows[0];

    // Log audit
    await logAudit({
      tenantId,
      userId,
      action: 'CREATE_PROJECT',
      entityType: 'project',
      entityId: project.id,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      data: {
        id: project.id,
        tenantId: project.tenant_id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.created_by,
        createdAt: project.created_at
      }
    });
  } catch (err) {
    return next(err);
  }
};

const listProjects = async (req, res, next) => {
  try {
    const { tenantId, role } = req.user;
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT p.*, u.full_name as creator_name,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
    `;
    const values = [];
    let paramCount = 1;

    // Apply tenant filter for non-super admins
    if (role !== 'super_admin') {
      query += ` WHERE p.tenant_id = $${paramCount}`;
      values.push(tenantId);
      paramCount++;
    } else {
      query += ` WHERE 1=1`;
    }

    // Apply filters
    if (status) {
      query += ` AND p.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND p.name ILIKE $${paramCount}`;
      values.push(`%${search}%`);
      paramCount++;
    }

    // Count total - FIXED: Use a separate query for counting
    const countQuery = `
      SELECT COUNT(*) 
      FROM projects p
      ${role !== 'super_admin' ? 'WHERE p.tenant_id = $1' : 'WHERE 1=1'}
      ${status ? ` AND p.status = $${role !== 'super_admin' ? 2 : 1}` : ''}
      ${search ? ` AND p.name ILIKE $${role !== 'super_admin' ? (status ? 3 : 2) : (status ? 2 : 1)}` : ''}
    `;
    
    const countValues = [];
    if (role !== 'super_admin') countValues.push(tenantId);
    if (status) countValues.push(status);
    if (search) countValues.push(`%${search}%`);
    
    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);

    return res.json({
      success: true,
      data: {
        projects: result.rows.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          createdBy: {
            id: project.created_by,
            fullName: project.creator_name
          },
          taskCount: parseInt(project.task_count),
          completedTaskCount: parseInt(project.completed_task_count),
          createdAt: project.created_at
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

const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const { tenantId, id: userId, role } = req.user;

    // Verify project exists and belongs to tenant
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );
    if (projectCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
        data: null
      });
    }

    const project = projectCheck.rows[0];

    // Authorization check
    const isCreator = project.created_by === userId;
    const isTenantAdmin = role === 'tenant_admin';
    const isSuperAdmin = role === 'super_admin';
    const isSameTenant = project.tenant_id === tenantId;

    if (!isSuperAdmin && (!isSameTenant || (!isCreator && !isTenantAdmin))) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
        data: null
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'Nothing to update',
        data: null
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(projectId);

    const query = `
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, description, status, updated_at
    `;

    const result = await pool.query(query, values);
    const updatedProject = result.rows[0];

    // Log audit
    await logAudit({
      tenantId: project.tenant_id,
      userId,
      action: 'UPDATE_PROJECT',
      entityType: 'project',
      entityId: projectId,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        updatedAt: updatedProject.updated_at
      }
    });
  } catch (err) {
    return next(err);
  }
};

const deleteProject = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { projectId } = req.params;
    const { tenantId, id: userId, role } = req.user;

    await client.query('BEGIN');

    // Verify project exists
    const projectCheck = await client.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );
    if (projectCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Project not found',
        data: null
      });
    }

    const project = projectCheck.rows[0];

    // Authorization check
    const isCreator = project.created_by === userId;
    const isTenantAdmin = role === 'tenant_admin';
    const isSuperAdmin = role === 'super_admin';
    const isSameTenant = project.tenant_id === tenantId;

    if (!isSuperAdmin && (!isSameTenant || (!isCreator && !isTenantAdmin))) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
        data: null
      });
    }

    // Delete project (cascade will delete tasks)
    await client.query('DELETE FROM projects WHERE id = $1', [projectId]);

    await client.query('COMMIT');

    // Log audit
    await logAudit({
      tenantId: project.tenant_id,
      userId,
      action: 'DELETE_PROJECT',
      entityType: 'project',
      entityId: projectId,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Project deleted successfully',
      data: null
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
};

module.exports = { createProject, listProjects, updateProject, deleteProject };