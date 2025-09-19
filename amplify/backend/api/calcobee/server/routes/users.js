const express = require('express');
const router = express.Router();

// In-memory storage for users (replace with database in production)
let users = [
  { _id: '1', username: 'admin', role: 'admin' },
  { _id: '2', username: 'user1', role: 'user' }
];

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Add a new user
router.post('/', (req, res) => {
  const { username, password, role } = req.body;
  
  // Basic validation
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  // Create new user
  const newUser = {
    _id: String(users.length + 1),
    username,
    role
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

// Delete a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(user => user._id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.status(204).send();
});

module.exports = router; 