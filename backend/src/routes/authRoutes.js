// backend/src/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// API 1: Tenant Registration
router.post(
  '/register-tenant',
  [
    body('tenantName').isString().notEmpty(),
    body('subdomain').isString().notEmpty(),
    body('adminEmail').isEmail(),
    body('adminPassword').isString().isLength({ min: 8 }),
    body('adminFullName').isString().notEmpty(),
  ],
  validate,
  authController.registerTenant,
);

// API 2: User Login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isString().notEmpty(),
    body('tenantSubdomain').optional().isString(),
    body('tenantId').optional().isString(),
  ],
  validate,
  authController.login,
);

// API 3: Get Current User
router.get('/me', auth, authController.me);

// API 4: Logout
router.post('/logout', auth, authController.logout);

module.exports = router;
