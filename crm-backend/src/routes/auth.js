// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

/**
 * POST /api/auth/register
 * body: { first_name, last_name, email, phone, password }
 */
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, phone, password } = req.body;
    if (!first_name || !last_name || !email || !phone || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        // check existing user by email or phone
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1', [email, phone]);
        if (existing.length) return res.status(400).json({ error: 'Email or phone already used' });

        // hash password
        const hash = bcrypt.hashSync(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (first_name, last_name, email, phone, password, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, hash, null]
        );

        return res.json({ ok: true, userId: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

/**
 * POST /api/auth/login
 * body: { emailOrPhone, password }
 * returns { token, expiresIn }
 */
router.post('/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ error: 'Missing credentials' });

    try {
        const [rows] = await pool.query(
            'SELECT id, password FROM users WHERE email = ? OR phone = ? LIMIT 1',
            [emailOrPhone, emailOrPhone]
        );
        if (!rows.length) return res.status(400).json({ error: 'User not found' });

        const user = rows[0];
        const ok = bcrypt.compareSync(password, user.password);
        if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

        // 🟢 FIX: Changing 'userId' to 'id' for consistency (user.id is the database column)
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' }); 
        return res.json({ token, expiresIn: 15 * 60 }); // expiresIn in seconds
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;