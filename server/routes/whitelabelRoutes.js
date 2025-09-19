const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middleware/auth');
const { calculateBrochureCost, calculateBookCost } = require('../utils/calculators');

// Middleware to validate API key
router.use(validateApiKey);

// POST /api/whitelabel/brochure
router.post('/brochure', async (req, res) => {
  try {
    const {
      size,
      quantity,
      totalPages,
      coverGSM,
      insideGSM,
      coverLamination,
      insideLamination,
      spotUV,
      coating,
      dripOff,
      binding
    } = req.body;

    // Validate required fields
    if (!size || !quantity || !totalPages || !coverGSM || !insideGSM) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['size', 'quantity', 'totalPages', 'coverGSM', 'insideGSM']
      });
    }

    const result = await calculateBrochureCost({
      size,
      quantity,
      totalPages,
      coverGSM,
      insideGSM,
      coverLamination,
      insideLamination,
      spotUV,
      coating,
      dripOff,
      binding
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Brochure calculation error:', error);
    res.status(500).json({
      error: 'Error calculating brochure cost',
      message: error.message
    });
  }
});

// POST /api/whitelabel/book
router.post('/book', async (req, res) => {
  try {
    const {
      size,
      quantity,
      totalPages,
      coverGSM,
      insideGSM,
      coverLamination,
      insideLamination,
      spotUV,
      coating,
      dripOff,
      binding
    } = req.body;

    // Validate required fields
    if (!size || !quantity || !totalPages || !coverGSM || !insideGSM) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['size', 'quantity', 'totalPages', 'coverGSM', 'insideGSM']
      });
    }

    const result = await calculateBookCost({
      size,
      quantity,
      totalPages,
      coverGSM,
      insideGSM,
      coverLamination,
      insideLamination,
      spotUV,
      coating,
      dripOff,
      binding
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Book calculation error:', error);
    res.status(500).json({
      error: 'Error calculating book cost',
      message: error.message
    });
  }
});

// GET /api/whitelabel/config
router.get('/config', async (req, res) => {
  try {
    const config = {
      paperSizes: [
        { value: "A3", label: "A3" },
        { value: "A4", label: "A4" },
        { value: "A5", label: "A5" },
        { value: "A6", label: "A6" },
        { value: "11x8.5", label: "11x8.5" },
        { value: "5.5x8.5", label: "5.5x8.5" },
        { value: "5.5x4.23", label: "5.5x4.23" },
        { value: "B3", label: "B3 (13.9 × 19.7)" },
        { value: "B4", label: "B4 (9.8 × 13.9)" },
        { value: "B5", label: "B5 (6.9 × 9.8)" },
        { value: "B6", label: "B6 (4.9 × 6.9)" },
        { value: "B7", label: "B7 (3.5 × 4.9)" }
      ],
      gsmOptions: {
        cover: ["130", "170", "210", "250", "300", "350", "400"],
        inside: ["60", "70", "80", "90", "100", "130", "170"]
      },
      laminationOptions: [
        "None",
        "Gloss BOPP",
        "Matt BOPP",
        "Gloss Thermal",
        "Matt Thermal",
        "Velvet"
      ],
      bindingOptions: [
        { value: "none", label: "No Binding" },
        { value: "staple", label: "Staple / Saddle Stitch" },
        { value: "spiral", label: "Spiral Binding" },
        { value: "wiro", label: "Wiro Binding" },
        { value: "perfect", label: "Perfect Binding" }
      ],
      spotUVOptions: ["None", "Cover Only", "Full Book"],
      coatingOptions: ["None", "Gloss", "Matt"],
      dripOffOptions: ["None", "Cover Only", "Full Book"]
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({
      error: 'Error fetching configuration',
      message: error.message
    });
  }
});

module.exports = router; 