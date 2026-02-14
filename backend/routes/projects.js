const express = require("express");
const pool = require("../db");
const router = express.Router();
const { authMiddleware } = require("./auth");
const { v4: uuidv4 } = require("uuid");

// POST /api/projects - Create project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const tenantId = req.user.tenant_id;
    const createdBy = req.user.user_id;

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });

    const projectId = uuidv4();

    await pool.query(
      `INSERT INTO projects (id, tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        projectId,
        tenantId,
        name,
        description || "",
        status || "active",
        createdBy,
      ],
    );

    res
      .status(201)
      .json({
        success: true,
        data: { id: projectId, name, description, status },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/projects - List projects for tenant
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const result = await pool.query(
      "SELECT * FROM projects WHERE tenant_id = $1",
      [tenantId],
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/projects/:projectId - Update project
router.put("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const result = await pool.query(
      `UPDATE projects SET name=$1, description=$2, status=$3, updated_at=NOW()
       WHERE id=$4 AND tenant_id=$5 RETURNING *`,
      [name, description, status, projectId, req.user.tenant_id],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/projects/:projectId - Delete project
router.delete("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `DELETE FROM projects WHERE id=$1 AND tenant_id=$2 RETURNING *`,
      [projectId, req.user.tenant_id],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
