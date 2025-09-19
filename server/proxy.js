/**
 * Proxy configuration for production
 * This file sets up a proxy to forward API requests to the appropriate server
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs-extra');

// Create a proxy middleware for API requests
const setupProxy = (app) => {
  // Proxy middleware configuration
  const proxyOptions = {
    target: process.env.API_URL || 'http://localhost:5001',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '/api', // Keep the /api prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log the request being proxied
      console.log(`Proxying ${req.method} request to: ${proxyReq.path}`);
      
      // Ensure proper headers for API requests
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Accept', 'application/json');
    },
    onProxyRes: (proxyRes, req, res) => {
      // Ensure content type is set correctly for API responses
      if (req.path.startsWith('/api/')) {
        proxyRes.headers['content-type'] = 'application/json';
        proxyRes.headers['access-control-allow-origin'] = process.env.NODE_ENV === 'production' 
          ? 'https://calcobee.com' 
          : 'http://localhost:3000';
        proxyRes.headers['access-control-allow-credentials'] = 'true';
      }
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      // Send a proper JSON error response
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
          ? 'https://calcobee.com' 
          : 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
      });
      res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
    },
  };

  // Apply proxy middleware to API routes
  app.use('/api', (req, res, next) => {
    // Remove trailing slash if present
    if (req.path.endsWith('/') && req.path.length > 1) {
      const query = req.url.slice(req.path.length);
      req.url = req.path.slice(0, -1) + query;
    }
    
    // Set CORS headers for preflight requests
    res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? 'https://calcobee.com' 
      : 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

  app.use('/api', createProxyMiddleware(proxyOptions));

  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle all other routes by serving the React app
  app.get('*', (req, res) => {
    // If it's an API request, return 404 JSON response
    if (req.path.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
        ? 'https://calcobee.com' 
        : 'http://localhost:3000');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      return res.status(404).json({ 
        error: 'API endpoint not found', 
        path: req.originalUrl,
        method: req.method
      });
    }
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
};

module.exports = setupProxy;
