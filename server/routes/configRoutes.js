const express = require('express');
const fs = require("fs");
const path = require("path");

const router = express.Router();
const configPath = path.join(__dirname, "..", "config.json");

// Ensure config directory exists
const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// GET /api/config => Return current config
router.get("/", (req, res) => {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf-8");
      res.setHeader('Content-Type', 'application/json');
      return res.json(JSON.parse(data));
    } else {
      // If config file doesn't exist, return a default config
      const defaultConfig = {
        paperRate: 100,
        plateCost4C: 2000,
        newSizePlateCost4C: 2500,
        plateCost1C: 1000,
        newSizePlateCost1C: 1500,
        printingCostPer1000_4C: 300,
        printingCostPer1000_1C: 150,
        laminationRates: {
          "None": 0,
          "Gloss BOPP": 1.8,
          "Matt BOPP": 1.8,
          "Gloss Thermal": 3.2,
          "Matt Thermal": 3.2,
          "Velvet": 11.25
        },
        newSizeLaminationRates: {
          "None": 0,
          "Gloss BOPP": 2.5,
          "Matt BOPP": 2.5,
          "Gloss Thermal": 4.5,
          "Matt Thermal": 4.5,
          "Velvet": 18
        },
        minimumLaminationCosts: {
          "BOPP": 600,
          "Thermal": 700,
          "Velvet": 700
        },
        spotUVRate: 2.5,
        spotUVMinimum: 3500,
        dripOffRate: 2.5,
        dripOffMinimum: 4500,
        coatingRate: 1.2,
        coatingMinimum: 500,
        bindingRates: {
          "none": 0,
          "staple": 2,
          "spiral": 15,
          "wiro": 15,
          "perfect": 25
        },
        newSizePlateCostPer1000_4C: 350,
        newSizeCostPer1000_1C: 180
      };

      // Write the default config to file
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
      
      res.setHeader('Content-Type', 'application/json');
      return res.json(defaultConfig);
    }
  } catch (err) {
    console.error("Error reading config:", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ 
      error: "Failed to read config",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/config => Update config
router.put("/", (req, res) => {
  console.log("Received PUT request with body:", req.body);
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Invalid request body",
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    // Write the config file
    fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2), "utf-8");
    console.log("Configuration written to file successfully");
    
    // Return the full updated config object
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      ...req.body,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error updating config:", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ 
      error: "Failed to update config",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Handle trailing slashes
router.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

module.exports = router; 