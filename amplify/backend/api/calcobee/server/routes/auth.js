const express = require('express');
const router = express.Router();

// In-memory storage for users (replace with database in production)
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user1', password: 'user123', role: 'user' }
];

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // In a real app, you'd use JWT or session-based authentication
    res.json({ 
      success: true, 
      user: { 
        username: user.username, 
        role: user.role 
      } 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});

module.exports = router; 