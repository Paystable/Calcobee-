const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');

// Middleware to check if user is authenticated as admin
const isAdmin = (req, res, next) => {
  // TODO: Implement proper admin authentication
  // For now, we'll just check for a basic auth header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      error: 'Authentication required',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Admin panel routes
router.get('/', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../../admin/build/index.html'));
});

// Admin API routes
router.get('/api/config', isAdmin, async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../config/config.json');
    if (fs.existsSync(configPath)) {
      const data = await fs.readFile(configPath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      return res.json(JSON.parse(data));
    } else {
      // Return default config if file doesn't exist
      const defaultConfig = {
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
        newSizePlateCostPer1000_4C: 350,
        newSizeCostPer1000_1C: 180,
      };
      res.setHeader('Content-Type', 'application/json');
      return res.json(defaultConfig);
    }
  } catch (err) {
    console.error('Error reading config:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      error: 'Failed to read config',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/api/config', isAdmin, async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../config/config.json');
    const configDir = path.dirname(configPath);
    
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      await fs.mkdir(configDir, { recursive: true });
    }

    // Write the config file
    await fs.writeFile(configPath, JSON.stringify(req.body, null, 2), 'utf-8');
    console.log('Configuration written to file successfully');
    
    // Return the updated config
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      ...req.body,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating config:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      error: 'Failed to update config',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 