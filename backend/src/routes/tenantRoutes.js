// backend/src/routes/tenantRoutes.js
const express = require('express');
const { query, body } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const tenantIsolation = require('../middleware/tenantIsolation');
const validate = require('../middleware/validate');
const tenantController = require('../controllers/tenantController');

const router = express.Router();

// API 5: Get Tenant Details
router.get('/:tenantId', auth, tenantIsolation, tenantController.getTenantDetails);

// API 6: Update Tenant
router.put(
  '/:tenantId',
  auth,
  tenantIsolation,
  [
    body('name').optional().isString(),
    body('status').optional().isIn(['active', 'suspended', 'trial']),
    body('subscriptionPlan').optional().isIn(['free', 'pro', 'enterprise']),
    body('maxUsers').optional().isInt({ min: 1 }),
    body('maxProjects').optional().isInt({ min: 1 }),
  ],
  validate,
  tenantController.updateTenant,
);

// API 7: List All Tenants (super_admin only)
router.get(
  '/',
  auth,
  authorize('super_admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'suspended', 'trial']),
    query('subscriptionPlan').optional().isIn(['free', 'pro', 'enterprise']),
  ],
  validate,
  tenantController.listTenants,
);

module.exports = router;
