// backend/src/routes/userRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const tenantIsolation = require('../middleware/tenantIsolation');
const validate = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();

// API 8: Add User to Tenant
router.post(
  '/tenants/:tenantId/users',
  auth,
  tenantIsolation,
  authorize('tenant_admin'),
  [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 8 }),
    body('fullName').isString().notEmpty(),
    body('role').optional().isIn(['user', 'tenant_admin']),
  ],
  validate,
  userController.addUserToTenant,
);

// API 9: List Tenant Users
router.get(
  '/tenants/:tenantId/users',
  auth,
  tenantIsolation,
  [
    query('search').optional().isString(),
    query('role').optional().isIn(['super_admin', 'tenant_admin', 'user']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  userController.listTenantUsers,
);

// API 10: Update User
router.put(
  '/users/:userId',
  auth,
  [
    body('fullName').optional().isString(),
    body('role').optional().isIn(['user', 'tenant_admin', 'super_admin']),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  userController.updateUser,
);

// API 11: Delete User
router.delete('/users/:userId', auth, authorize('tenant_admin'), userController.deleteUser);

module.exports = router;
