const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Received request for calculation with body:", req.body); // Log request body
  try {
    const { sheetSize, paperRate, totalSheets, coverGSM, insideGSM, doubleSided, lamination, laminationType, spotUV, spotUVSide, coatingOption } = req.body;

    // Convert GSM values to numbers
    const coverGSMNum = Number(coverGSM);
    const insideGSMNum = Number(insideGSM);

    // Calculate paper cost
    const paperCost = (paperRate * coverGSMNum * totalSheets) / 3.22; // Use coverGSMNum

    // Calculate printing cost
    let printingCost = doubleSided ? paperCost * 2 : paperCost;

    // Calculate lamination cost if applicable
    let laminationCost = 0;
    if (lamination && laminationType) {
      const laminationRate = req.app.locals.config.laminationRates[laminationType];
      laminationCost = totalSheets * laminationRate * (doubleSided ? 2 : 1);
    }

    // Calculate Spot UV cost if applicable
    let spotUVCost = 0;
    if (spotUV) {
      const spotUVRate = req.app.locals.config.spotUVRateVal;
      const spotUVFixedCost = req.app.locals.config.spotUVFixedPerPlate;
      
      spotUVCost = (totalSheets * spotUVRate) + 
        (spotUVSide === "double" ? spotUVFixedCost * 2 : spotUVFixedCost);
    }

    // Calculate coating cost if applicable
    let coatingCost = 0;
    if (coatingOption && coatingOption !== "None") {
      const coatingRate = req.app.locals.config.coatingRate;
      const coatingMinimum = req.app.locals.config.coatingMinimum;
      
      const calculatedCost = totalSheets * coatingRate * 
        (coatingOption === "Both Sides" ? 2 : 1);
      
      coatingCost = Math.max(calculatedCost, coatingMinimum);
    }

    // Calculate total cost
    const totalCost = printingCost + laminationCost + spotUVCost + coatingCost;

    console.log("Calculation results:", {
      paperCost,
      printingCost,
      laminationCost,
      spotUVCost,
      coatingCost,
      totalCost,
    });
    
    res.json({
      paperCost,
      printingCost,
      laminationCost,
      spotUVCost,
      coatingCost,
      totalCost,
    });
  } catch (error) {
    console.error("Calculation error:", error);
    res.status(500).json({ message: "Error performing calculation" });
  }
});

// Temporary response for testing GET requests
router.get("/", (req, res) => {
    res.send("Calculate endpoint is active");
});

module.exports = router;
