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
  // Proxy API requests to the backend server first
  app.use('/api', createProxyMiddleware({
    target: process.env.API_URL || 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api', // Keep the /api prefix
    },
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Always set content-type to application/json for API responses
      res.setHeader('Content-Type', 'application/json');
      
      // Copy all headers from the proxied response
      Object.keys(proxyRes.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-type') { // Skip content-type as we set it above
          res.setHeader(key, proxyRes.headers[key]);
        }
      });
    }
  }));

  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle all other routes by serving the React app
  app.get('*', (req, res) => {
    // If it's an API request, return 404 JSON response
    if (req.path.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
    }
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
};

module.exports = setupProxy;
