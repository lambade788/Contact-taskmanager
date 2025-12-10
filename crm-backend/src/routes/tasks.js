// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

/**
 * Create task
 * POST /api/tasks
 */
router.post('/', auth, async (req, res) => {
  const userId = req.user.id;
  const { contact_id, title, description, status, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });

  try {
    if (contact_id) {
      const [c] = await pool.query('SELECT id FROM users_contact WHERE id = ? AND user_id = ?', [contact_id, userId]);
      if (!c.length) return res.status(400).json({ error: 'Invalid contact' });
    }
    const [result] = await pool.query(
      `INSERT INTO users_task (user_id, contact_id, title, description, status, due_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, contact_id || null, title, description || null, status || 'pending', due_date || null, userId]
    );
    res.json({ ok: true, taskId: result.insertId });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * List tasks for user
 * GET /api/tasks
 */
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT ut.*, uc.contact_full_name AS contact_name
        FROM users_task ut
        LEFT JOIN users_contact uc ON uc.id = ut.contact_id
        WHERE ut.user_id = ?
        ORDER BY ut.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get single task
 * GET /api/tasks/:id
 */
router.get('/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM users_task WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update task
 * PUT /api/tasks/:id
 * This route is used for both full updates and partial updates (like status change).
 */
router.put('/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  // Destructure all expected fields
  const { title, description, status, due_date, contact_id } = req.body; 

  try {
    // 1. Fetch existing task to ensure it exists and belongs to the user
    const [existingTaskRows] = await pool.query('SELECT * FROM users_task WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!existingTaskRows.length) return res.status(404).json({ error: 'Task not found or not allowed' });
    const existingTask = existingTaskRows[0];
    
    // 2. Merge new body data with existing data to handle partial updates gracefully.
    // If the frontend only sends 'status', the other fields retain their existing values.
    const mergedData = {
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      status: status !== undefined ? status : existingTask.status,
      due_date: due_date !== undefined ? due_date : existingTask.due_date,
      contact_id: contact_id !== undefined ? contact_id : existingTask.contact_id,
    };
    
    if (mergedData.contact_id) {
      const [c] = await pool.query('SELECT id FROM users_contact WHERE id = ? AND user_id = ?', [mergedData.contact_id, userId]);
      if (!c.length) return res.status(400).json({ error: 'Invalid contact' });
    }
    
    // Perform the update with merged data
    const [result] = await pool.query(
      `UPDATE users_task SET title=?, description=?, status=?, due_date=?, contact_id=?, updated_by=? WHERE id=? AND user_id=?`,
      [mergedData.title, mergedData.description, mergedData.status, mergedData.due_date, mergedData.contact_id, userId, taskId, userId]
    );
    
    if (result.affectedRows === 0) return res.status(500).json({ error: 'Update failed unexpectedly' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete task
 * DELETE /api/tasks/:id
 */
router.delete('/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM users_task WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or not allowed' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;