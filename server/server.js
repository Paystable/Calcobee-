/************************************************************
 * server.js
 * Usage:
 *   node server.js
 *
 * For local dev, set environment variables as needed (e.g. NODE_ENV).
 ************************************************************/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const calculateRoutes = require('./routes/calculateRoutes');
const configRoutes = require('./routes/configRoutes');
const conversionRoutes = require('./routes/conversionRoutes');
const usersRoutes = require('./routes/usersRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const setupProxy = require('./proxy');

// If running Node < 18, uncomment the line below
// and install node-fetch by running: npm install node-fetch
// const fetch = require('node-fetch');

const app = express();

// Default to port 5001 if not specified
const PORT = process.env.PORT || 5001;

// Body parsing middleware - MUST come before routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://calcobee.com', 'https://www.calcobee.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/**
 * 1) Sample In-Memory Config
 * In a real app, you'd load this from a DB or file.
 */
let defaultConfig = {
  paperRate: 100,
  plateCost4C: 2000,
  newSizePlateCost4C: 2500,
  plateCost1C: 1000,
  newSizePlateCost1C: 1500,
  costPer1000Default: 500,
  laminationRates: {
    "None": 0,
    "Gloss BOPP": 1.8,
    "Matt BOPP": 1.8,
    "Gloss Thermal": 3.2,
    "Matt Thermal": 3.2,
    "Velvet": 11.25,
  },
  newSizeLaminationRates: {
    "None": 0,
    "Gloss BOPP": 2.5,
    "Matt BOPP": 2.5,
    "Gloss Thermal": 4.5,
    "Matt Thermal": 4.5,
    "Velvet": 18,
  },
  minimumLaminationCosts: {
    "BOPP": 600,
    "Thermal": 700,
    "Velvet": 700,
  },
  spotUVRate: 2.5,
  spotUVMinimum: 3500,
  dripOffRate: 2.5,
  dripOffMinimum: 4500,
  coatingRate: 1.2,
  coatingMinimum: 500,
};

// Middleware to handle trailing slashes for API routes
// This ensures consistent URL handling across the application
app.use('/api', (req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// API Routes - These must come BEFORE the static file serving
app.use('/api/config', configRoutes);
app.use('/api/calculate', calculateRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);

// Admin routes - These must come BEFORE the static file serving
app.use('/admin', adminRoutes);

// Serve static files and handle routes in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Serve admin panel static files
  app.use('/admin', express.static(path.join(__dirname, '../admin/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // If it's an API request or admin request, let it pass through
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/')) {
      return next();
    }

    // Serve main app
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });

  // Handle all API requests
  app.all('/api/*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });
} else {
  // In development, handle API requests and serve static files
  console.log('Running in development mode');
  
  // Serve static files from both client and admin builds
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.use('/admin', express.static(path.join(__dirname, '../admin/build')));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Ensure CORS headers are set even for errors
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? ['https://calcobee.com', 'https://www.calcobee.com']
    : 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Always send JSON response for errors
  res.setHeader('Content-Type', 'application/json');
  
  // If this is an API request, return a proper JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  // For non-API requests, still return JSON but with less detail
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

/**
 * 6) Start the Server
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});