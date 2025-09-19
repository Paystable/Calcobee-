const express = require('express');
const fs = require("fs");
const path = require("path");

const router = express.Router();
const configPath = path.join(__dirname, "..", "config.json");

// GET /api/config => Return current config
router.get("/", (req, res) => {
  try {
    // Ensure the config directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

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
        }
      };

      // Write the default config to file
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
      
      res.setHeader('Content-Type', 'application/json');
      return res.json(defaultConfig);
    }
  } catch (err) {
    console.error("Error reading config:", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: "Failed to read config" });
  }
});

// PUT /api/config => Update config
// (In production, you'd add authentication for admin!)
router.put("/", (req, res) => {
  console.log("Received PUT request with body:", req.body);
  
  try {
    // Ensure the config directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write the config file
    fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2), "utf-8");
    console.log("Configuration written to file successfully");
    
    // Return the full updated config object
    res.setHeader('Content-Type', 'application/json');
    return res.json(req.body);
  } catch (err) {
    console.error("Error updating config:", err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: "Failed to update config" });
  }
});

// POST /api/calculate => Handle calculation requests
router.post("/calculate", (req, res) => {
  console.log("Received calculation request:", req.body); // Log the incoming request

  const { calcType, ...params } = req.body;

  // Implement calculation logic based on calcType
  // For now, just return the received parameters for demonstration
  return res.json({ message: "Calculation successful", data: params });
});

module.exports = { router };
