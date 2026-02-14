const express = require("express");
const pool = require("../db");
const router = express.Router();
const { authMiddleware } = require("./auth");

// GET /api/tenants - List all tenants
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tenants");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/tenants/:tenantId - Get tenant by ID
router.get("/:tenantId", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const result = await pool.query("SELECT * FROM tenants WHERE id = $1", [
      tenantId,
    ]);
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/tenants/:tenantId/users - List users for a tenant
router.get("/:tenantId/users", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const result = await pool.query(
      "SELECT id, full_name, email, role, is_active FROM users WHERE tenant_id = $1",
      [tenantId],
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/tenants/:tenantId - Update tenant
router.put("/:tenantId", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const {
      name,
      subdomain,
      status,
      subscription_plan,
      max_users,
      max_projects,
    } = req.body;

    const result = await pool.query(
      `UPDATE tenants
       SET name = $1, subdomain = $2, status = $3, subscription_plan = $4,
           max_users = $5, max_projects = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        name,
        subdomain,
        status,
        subscription_plan,
        max_users,
        max_projects,
        tenantId,
      ],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
