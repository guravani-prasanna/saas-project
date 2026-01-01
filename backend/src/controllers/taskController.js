const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;
    const { tenantId, id: userId } = req.user;

    // Verify project exists and belongs to tenant
    const projectCheck = await pool.query(
      'SELECT tenant_id FROM projects WHERE id = $1',
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
    
    // Verify project belongs to user's tenant
    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Project does not belong to your tenant',
        data: null
      });
    }

    // If assignedTo is provided, verify user belongs to same tenant
    if (assignedTo) {
      const userCheck = await pool.query(
        'SELECT 1 FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );
      if (userCheck.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to this tenant',
          data: null
        });
      }
    }

    // Create task
    const result = await pool.query(
      `INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'todo', $5, $6, $7)
       RETURNING id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at`,
      [projectId, tenantId, title, description, priority, assignedTo, dueDate]
    );

    const task = result.rows[0];

    // Log audit
    await logAudit({
      tenantId,
      userId,
      action: 'CREATE_TASK',
      entityType: 'task',
      entityId: task.id,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      data: {
        id: task.id,
        projectId: task.project_id,
        tenantId: task.tenant_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to,
        dueDate: task.due_date,
        createdAt: task.created_at
      }
    });
  } catch (err) {
    return next(err);
  }
};

const listProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { tenantId } = req.user;
    const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Verify project belongs to tenant
    const projectCheck = await pool.query(
      'SELECT 1 FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );
    if (projectCheck.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: 'Project does not belong to your tenant',
        data: null
      });
    }

    let query = `
      SELECT t.*, u.full_name as assigned_name, u.email as assigned_email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1 AND t.tenant_id = $2
    `;
    const values = [projectId, tenantId];
    let paramCount = 3;

    // Apply filters
    if (status) {
      query += ` AND t.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (assignedTo) {
      query += ` AND t.assigned_to = $${paramCount}`;
      values.push(assignedTo);
      paramCount++;
    }

    if (priority) {
      query += ` AND t.priority = $${paramCount}`;
      values.push(priority);
      paramCount++;
    }

    if (search) {
      query += ` AND t.title ILIKE $${paramCount}`;
      values.push(`%${search}%`);
      paramCount++;
    }

    // Count total
    const countQuery = query.replace('SELECT t.*, u.full_name as assigned_name, u.email as assigned_email', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and ordering
    query += ` ORDER BY 
      CASE priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END, 
      due_date ASC NULLS LAST
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);

    return res.json({
      success: true,
      data: {
        tasks: result.rows.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assigned_to ? {
            id: task.assigned_to,
            fullName: task.assigned_name,
            email: task.assigned_email
          } : null,
          dueDate: task.due_date,
          createdAt: task.created_at
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

const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    // Verify task exists and belongs to tenant
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [taskId, tenantId]
    );
    if (taskCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or does not belong to your tenant',
        data: null
      });
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, taskId]
    );

    const updatedTask = result.rows[0];

    return res.json({
      success: true,
      data: {
        id: updatedTask.id,
        status: updatedTask.status,
        updatedAt: updatedTask.updated_at
      }
    });
  } catch (err) {
    return next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const { tenantId, id: userId } = req.user;

    // Verify task exists and belongs to tenant
    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );
    if (taskCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
        data: null
      });
    }

    const task = taskCheck.rows[0];
    
    if (task.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Task does not belong to your tenant',
        data: null
      });
    }

    // If assignedTo is provided, verify user belongs to same tenant
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const userCheck = await pool.query(
          'SELECT 1 FROM users WHERE id = $1 AND tenant_id = $2',
          [assignedTo, tenantId]
        );
        if (userCheck.rowCount === 0) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user does not belong to this tenant',
            data: null
          });
        }
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assignedTo);
    }

    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(dueDate);
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'Nothing to update',
        data: null
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(taskId);

    const query = `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, status, priority, assigned_to, due_date, updated_at
    `;

    const result = await pool.query(query, values);
    const updatedTask = result.rows[0];

    // Get assigned user details if assigned
    let assignedUser = null;
    if (updatedTask.assigned_to) {
      const userResult = await pool.query(
        'SELECT id, full_name, email FROM users WHERE id = $1',
        [updatedTask.assigned_to]
      );
      if (userResult.rowCount > 0) {
        assignedUser = userResult.rows[0];
      }
    }

    // Log audit
    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE_TASK',
      entityType: 'task',
      entityId: taskId,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignedTo: assignedUser ? {
          id: assignedUser.id,
          fullName: assignedUser.full_name,
          email: assignedUser.email
        } : null,
        dueDate: updatedTask.due_date,
        updatedAt: updatedTask.updated_at
      }
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createTask, listProjectTasks, updateTaskStatus, updateTask };