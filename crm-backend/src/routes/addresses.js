// crm-backend/src/routes/addresses.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming this path correctly points to your db connection utility

// POST /api/addresses - Save a new address
router.post('/', async (req, res) => {
    const { contact_id, address_line1, address_line2, city, state, pincode, country } = req.body;

    // Basic Validation
    if (!contact_id || !address_line1 || !city) {
        return res.status(400).json({ error: 'Missing required fields: contact_id, address line 1, and city.' });
    }

    // SQL INSERT STATEMENT
    const sql = `
        INSERT INTO contact_address 
        (contact_id, address_line1, address_line2, city, state, pincode, country, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1) /* Assuming 'created_by' is placeholder or handled by auth middleware */
    `;
    
    const params = [
        contact_id, 
        address_line1, 
        address_line2 || null,
        city, 
        state || null, 
        pincode || null, 
        country || null
    ];

    try {
        const [result] = await db.query(sql, params);
        // Success response
        return res.status(201).json({ 
            message: 'Address added successfully', 
            id: result.insertId 
        });

    } catch (error) {
        console.error('Database error when inserting address:', error);
        return res.status(500).json({ error: 'Internal server error while saving address.' });
    }
});

module.exports = router;