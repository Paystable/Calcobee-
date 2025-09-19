const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const configRoutes = require('./routes/configRoutes');
const calculateRoutes = require('./routes/calculateRoutes');
const conversionRoutes = require('./routes/conversion');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://calcobee.com', 'https://www.calcobee.com'] 
    : ['http://localhost:3000', 'http://localhost:5001', 'http://192.168.29.220:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
}));

// Add middleware to ensure JSON content type for API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/config', configRoutes);
app.use('/api/calculate', calculateRoutes);
app.use('/api/conversion', conversionRoutes);

// Add a catch-all route for API requests that weren't handled by the specific routes
app.use('/api/*', (req, res) => {
  console.log(`Unhandled API route: ${req.originalUrl}`);
  res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Ensure CORS headers are set even for errors
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? 'https://calcobee.com' 
    : 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Always send JSON response for errors
  res.setHeader('Content-Type', 'application/json');
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export the Express app
module.exports = app; 