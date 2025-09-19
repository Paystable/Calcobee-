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
const { router: configRoutes } = require('./routes/configRoutes');
const conversionRoutes = require('./routes/conversion');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const setupProxy = require('./proxy');

// If running Node < 18, uncomment the line below
// and install node-fetch by running: npm install node-fetch
// const fetch = require('node-fetch');

const app = express();

// Default to port 5001 if not specified
const PORT = process.env.PORT || 5001;

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

/**
 * 2) Logging Middleware
 */
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

/**
 * 3) Root route
 */
app.get('/', (req, res) => {
  res.send('Server is running. Access the API at /api/config');
});

/**
 * 4) Health Check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/calculate', calculateRoutes);
app.use('/api/config', configRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);

// Add a catch-all route for API requests that weren't handled by the specific routes
app.use('/api/*', (req, res) => {
  console.log(`Unhandled API route: ${req.originalUrl}`);
  res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
});

// Serve static files and handle routes in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // If it's an API request, return 404 JSON response
    if (req.path.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
    }
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  // In development, handle API requests and serve static files
  console.log('Running in development mode');
  
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle API requests
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });
}

/**
 * 5) Global Error Handler
 */
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

/**
 * 6) Start the Server
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});