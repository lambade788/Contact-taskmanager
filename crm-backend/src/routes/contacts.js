const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Middleware to check token and set req.user
const pool = require('../db');

/**
 * Create contact
 * POST /api/contacts
 * body: { contact_first_name, contact_last_name, contact_number, contact_email, note }
 */
router.post('/', auth, async (req, res) => {
    // Note: Assuming authMiddleware sets req.user.id
    const userId = req.user.id; 
    const { contact_first_name, contact_last_name, contact_number, contact_email, note } = req.body;
    
    if (!contact_first_name || !contact_last_name || !contact_number) {
        // Proper validations check
        return res.status(400).json({ error: 'Missing required fields: first name, last name, or number' });
    }
    
    try {
        // CRITICAL SQL: This query is correct IF the database table has the name columns.
        const sql = `INSERT INTO users_contact (user_id, contact_first_name, contact_last_name, contact_number, contact_email, note, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await pool.query(sql,
            [
                userId,             // 1. user_id
                contact_first_name,  // 2. contact_first_name
                contact_last_name,   // 3. contact_last_name
                contact_number,      // 4. contact_number
                contact_email || null, // 5. contact_email (allows null)
                note || null,        // 6. note (allows null)
                userId,              // 7. created_by
                userId               // 8. updated_by
            ]
        );
        return res.json({ ok: true, contactId: result.insertId });
    } catch (err) {
        // ⭐ IMPORTANT: This line is added to show the specific MySQL error in your console
        console.error('Create contact database error:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            // Unique constraints enforced check
            return res.status(400).json({ error: 'Contact number already exists for this user' });
        }
        // General server error response
        return res.status(500).json({ error: 'Server error: Failed to save contact to database.' });
    }
});

/**
 * List contacts for current user, including nested Addresses and Tasks
 * GET /api/contacts
 */
router.get('/', auth, async (req, res) => {
    const userId = req.user.id; 
    
    try {
        // --- 1. Fetch ALL Contacts for the user ---
        const [contacts] = await pool.query(
            `SELECT id, contact_first_name, contact_last_name, contact_number, contact_email, note 
             FROM users_contact 
             WHERE user_id = ?`, 
            [userId]
        );

        if (contacts.length === 0) {
            return res.json([]); // Return an empty array if no contacts are found
        }
        
        // --- 2. Collect all Contact IDs to run subsequent queries efficiently ---
        const contactIds = contacts.map(c => c.id);

        // --- 3. Fetch ALL Addresses for those contacts ---
        const [addresses] = await pool.query(
            `SELECT * FROM contact_address WHERE contact_id IN (?)`,
            [contactIds]
        );

        // --- 4. Fetch ALL Tasks for those contacts ---
        const [tasks] = await pool.query(
            `SELECT * FROM users_task WHERE contact_id IN (?)`,
            [contactIds]
        );

        // --- 5. Combine (Map) the data into the contacts array ---
        const contactsMap = contacts.reduce((map, contact) => {
            // Initialize nested arrays for each contact
            contact.addresses = [];
            contact.tasks = [];
            map[contact.id] = contact;
            return map;
        }, {});

        // Map addresses to their respective contacts
        addresses.forEach(address => {
            if (contactsMap[address.contact_id]) {
                contactsMap[address.contact_id].addresses.push(address);
            }
        });

        // Map tasks to their respective contacts
        tasks.forEach(task => {
            if (contactsMap[task.contact_id]) {
                contactsMap[task.contact_id].tasks.push(task);
            }
        });

        // Convert the map back to an array of contact objects
        const finalContacts = Object.values(contactsMap);
        
        // This is the full data structure your frontend needs:
        res.json(finalContacts);

    } catch (err) {
        console.error('List contacts error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get single contact
 * GET /api/contacts/:id
 */
router.get('/:id', auth, async (req, res) => {
    const userId = req.user.id;
    const contactId = req.params.id;
    try {
        const sql = `SELECT * FROM users_contact WHERE id = ? AND user_id = ?`;
        const [rows] = await pool.query(sql, [contactId, userId]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        
        const contact = rows[0];

        // Fetch nested addresses and tasks for the single contact
        const [addresses] = await pool.query(`SELECT * FROM contact_address WHERE contact_id = ?`, [contactId]);
        const [tasks] = await pool.query(`SELECT * FROM users_task WHERE contact_id = ?`, [contactId]);

        contact.addresses = addresses;
        contact.tasks = tasks;
        
        res.json(contact);
    } catch (err) {
        console.error('Get contact error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


/**
 * Update contact
 * PUT /api/contacts/:id
 */
router.put('/:id', auth, async (req, res) => {
    const userId = req.user.id;
    const contactId = req.params.id;
    const { contact_first_name, contact_last_name, contact_number, contact_email, note } = req.body;

    try {
        const sql = `UPDATE users_contact SET contact_first_name=?, contact_last_name=?, contact_number=?, contact_email=?, note=?, updated_by=? WHERE id=? AND user_id=?`;

        const [result] = await pool.query(sql, [contact_first_name, contact_last_name, contact_number, contact_email || null, note || null, userId, contactId, userId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or not allowed' });
        res.json({ ok: true });
    } catch (err) {
        console.error('Update contact error:', err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Contact number already exists for this user' });
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Delete contact
 * DELETE /api/contacts/:id
 */
router.delete('/:id', auth, async (req, res) => {
    const userId = req.user.id;
    const contactId = req.params.id;
    try {
        // NOTE: You should consider deleting related addresses/tasks first, or use CASCADE DELETE in your DB setup
        const [result] = await pool.query('DELETE FROM users_contact WHERE id = ? AND user_id = ?', [contactId, userId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or not allowed' });
        res.json({ ok: true });
    } catch (err) {
        console.error('Delete contact error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Add or update address for a contact
 * POST /api/contacts/:id/address
 */
router.post('/:id/address', auth, async (req, res) => {
    const userId = req.user.id;
    const contactId = req.params.id;
    const { address_line1, address_line2, city, state, pincode, country } = req.body;
    if (!address_line1) return res.status(400).json({ error: 'Missing address_line1' });

    try {
        // ensure contact belongs to user
        const [c] = await pool.query('SELECT id FROM users_contact WHERE id = ? AND user_id = ?', [contactId, userId]);
        if (!c.length) return res.status(400).json({ error: 'Invalid contact' });

        const sql = `INSERT INTO contact_address (contact_id, address_line1, address_line2, city, state, pincode, country, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await pool.query(sql, 
            [contactId, address_line1, address_line2 || null, city || null, state || null, pincode || null, country || null, userId]
        );
        res.json({ ok: true, addressId: result.insertId });
    } catch (err) {
        console.error('Add address error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;