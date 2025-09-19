const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const configPath = path.join(__dirname, '../../data/config.json');

// Ensure config directory exists
fs.ensureDirSync(path.dirname(configPath));

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
  fs.writeJsonSync(configPath, {
    settings: {},
    lastUpdated: new Date().toISOString()
  });
}

// Get config
router.get('/', (req, res) => {
  try {
    const config = fs.readJsonSync(configPath);
    res.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

// Update config
router.put('/', (req, res) => {
  try {
    const config = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    fs.writeJsonSync(configPath, config, { spaces: 2 });
    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

module.exports = router; 