require('dotenv').config();
const express = require('express');
const pool = require('./db'); // Assuming this is correct
const cors = require('cors');

// --- 1. Initialize the Express app object ---
const app = express(); 

// --- 2. Apply Middleware ---
// Apply CORS middleware first
app.use(cors({ origin: 'http://localhost:3000' })); 

// Middleware to parse JSON bodies
app.use(express.json());

// --- 3. Define and Register Routes ---

// Import the new address route handler
const addressesRouter = require('./routes/addresses'); // 🌟 NEW IMPORT 🌟

app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/email', require('./routes/emails'));

// Register the new route for managing addresses
app.use('/api/addresses', addressesRouter); // 🌟 NEW ROUTE REGISTRATION 🌟


// Health Check/DB Test Route
app.get('/', async (req, res) => {
  try {
   const [rows] = await pool.query('SELECT 1 + 1 AS result');
     res.json({ ok: true, db: rows[0].result });
  } catch (err) {
    res.status(500).json({ error: 'DB error', detail: err.message });
  }
});

// --- 4. Start Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});