// crm-backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        
        // 🟢 FIX 1: Attach the ENTIRE decoded payload to req.user. 
        // Since we signed the token with { id: user.id }, req.user will now be { id: X }
        req.user = decoded; 
        
        // 🟢 FIX 2: Check if the ID property exists on the attached user object.
        if (!req.user || !req.user.id) {
            console.error("Authentication Error: Token verified but user ID is missing from payload.");
            return res.status(401).json({ error: 'Invalid token payload.' });
        }
        
        next(); 
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};