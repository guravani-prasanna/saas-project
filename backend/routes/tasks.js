const express = require("express");
const pool = require("../db");
const router = express.Router();
const { authMiddleware } = require("./auth");
const { v4: uuidv4 } = require("uuid");

// POST /api/projects/:projectId/tasks - Create task
router.post("/projects/:projectId/tasks", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const tenantId = req.user.tenant_id;
    const { title, description, status, priority, assigned_to, due_date } =
      req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });

    const taskId = uuidv4();

    await pool.query(
      `INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        taskId,
        projectId,
        tenantId,
        title,
        description || "",
        status || "todo",
        priority || "medium",
        assigned_to || null,
        due_date || null,
      ],
    );

    res
      .status(201)
      .json({ success: true, data: { id: taskId, title, status, priority } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/projects/:projectId/tasks - List tasks for project
router.get("/projects/:projectId/tasks", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const tenantId = req.user.tenant_id;

    const result = await pool.query(
      "SELECT * FROM tasks WHERE project_id=$1 AND tenant_id=$2",
      [projectId, tenantId],
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/tasks/:taskId/status - Update task status only
router.patch("/tasks/:taskId/status", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status)
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });

    const result = await pool.query(
      `UPDATE tasks SET status=$1, updated_at=NOW()
       WHERE id=$2 AND tenant_id=$3
       RETURNING *`,
      [status, taskId, req.user.tenant_id],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/tasks/:taskId - Update all task details
router.put("/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigned_to, due_date } =
      req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET title=$1, description=$2, status=$3, priority=$4, assigned_to=$5, due_date=$6, updated_at=NOW()
       WHERE id=$7 AND tenant_id=$8
       RETURNING *`,
      [
        title,
        description,
        status,
        priority,
        assigned_to,
        due_date,
        taskId,
        req.user.tenant_id,
      ],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
