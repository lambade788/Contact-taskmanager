// src/routes/emails.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

/**
 * Simulate send email (insert into email_logs)
 * POST /api/email/send
 * body: { to_email, subject, body }
 */
router.post('/send', auth, async (req, res) => {
  const { to_email, subject, body } = req.body;
  if (!to_email || !subject) return res.status(400).json({ error: 'Missing fields' });
  try {
    const [result] = await pool.query('INSERT INTO email_logs (to_email, subject, body) VALUES (?, ?, ?)', [to_email, subject, body || null]);
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * List recent email logs (admin/user)
 * GET /api/email
 */
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 200');
    res.json(rows);
  } catch (err) {
    console.error('List email logs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
