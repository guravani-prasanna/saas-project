const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const taskController = require('../controllers/taskController');

const router = express.Router();

// API 16: Create Task
router.post(
  '/projects/:projectId/tasks',
  auth,
  [
    body('title').isString().notEmpty(),
    body('description').optional().isString(),
    body('assignedTo').optional().isString(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional().isISO8601()
  ],
  validate,
  taskController.createTask
);

// API 17: List Project Tasks
router.get(
  '/projects/:projectId/tasks',
  auth,
  [
    query('status').optional().isIn(['todo', 'in_progress', 'completed']),
    query('assignedTo').optional().isString(),
    query('priority').optional().isIn(['low', 'medium', 'high']),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  taskController.listProjectTasks
);

// API 18: Update Task Status
router.patch(
  '/tasks/:taskId/status',
  auth,
  [
    body('status').isIn(['todo', 'in_progress', 'completed'])
  ],
  validate,
  taskController.updateTaskStatus
);

// API 19: Update Task
router.put(
  '/tasks/:taskId',
  auth,
  [
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('status').optional().isIn(['todo', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('assignedTo').optional().isString(),
    body('dueDate').optional().isISO8601()
  ],
  validate,
  taskController.updateTask
);

module.exports = router;