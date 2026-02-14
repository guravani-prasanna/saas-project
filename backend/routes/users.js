const express = require("express");
const pool = require("../db");
const router = express.Router();
const { authMiddleware } = require("./auth");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// POST /api/tenants/:tenantId/users - Create user
router.post("/tenants/:tenantId/users", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, tenant_id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, tenantId, full_name, email, hashedPassword, role],
    );

    res.status(201).json({
      success: true,
      data: { id: userId, full_name, email, role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/tenants/:tenantId/users - List users for tenant
router.get("/tenants/:tenantId/users", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const result = await pool.query(
      "SELECT id, full_name, email, role, is_active FROM users WHERE tenant_id = $1",
      [tenantId],
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/users/:userId - Update user
router.put("/users/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, email, role, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1, email = $2, role = $3, is_active = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, full_name, email, role, is_active`,
      [full_name, email, role, is_active, userId],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/users/:userId - Delete (deactivate) user
router.delete("/users/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `UPDATE users SET is_active = FALSE, updated_at = NOW()
       WHERE id = $1
       RETURNING id, full_name, email, role, is_active`,
      [userId],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
