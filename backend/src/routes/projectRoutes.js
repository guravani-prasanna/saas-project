const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const projectController = require('../controllers/projectController');

const router = express.Router();

// API 12: Create Project
router.post(
  '/',
  auth,
  [
    body('name').isString().notEmpty(),
    body('description').optional().isString(),
    body('status').optional().isIn(['active', 'archived', 'completed'])
  ],
  validate,
  projectController.createProject
);

// API 13: List Projects
router.get(
  '/',
  auth,
  [
    query('status').optional().isIn(['active', 'archived', 'completed']),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  projectController.listProjects
);

// API 14: Update Project
router.put(
  '/:projectId',
  auth,
  [
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('status').optional().isIn(['active', 'archived', 'completed'])
  ],
  validate,
  projectController.updateProject
);

// API 15: Delete Project
router.delete('/:projectId', auth, projectController.deleteProject);

module.exports = router;