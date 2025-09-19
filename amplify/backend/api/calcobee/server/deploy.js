/**
 * Deployment script for production
 * This script ensures that the server is properly configured for production use
 */

const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API routes
app.use('/api/calculate', require('./routes/calculateRoutes'));
app.use('/api/config', require('./routes/configRoutes').router);
app.use('/api/conversion', require('./routes/conversion'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 