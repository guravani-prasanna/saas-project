const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../db");

const router = express.Router();

/**
 * POST /api/auth/register-tenant
 */
router.post("/register-tenant", async (req, res) => {
  try {
    const { name, subdomain, email, password, full_name } = req.body;

    if (!name || !subdomain || !email || !password || !full_name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    const tenantId = uuidv4();
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO tenants (id, name, subdomain)
       VALUES ($1, $2, $3)`,
      [tenantId, name, subdomain],
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, 'TENANT_ADMIN')`,
      [userId, tenantId, email, hashedPassword, full_name],
    );

    const token = jwt.sign(
      { user_id: userId, tenant_id: tenantId, role: "TENANT_ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      success: true,
      data: { token, user: { id: userId, email, role: "TENANT_ADMIN" } },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.id, tenant_id: user.tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Auth middleware
 */
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * GET /api/auth/me
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [req.user.user_id],
    );
    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
