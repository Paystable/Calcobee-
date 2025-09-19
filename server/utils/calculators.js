const config = require('../config');

// Helper function to calculate paper cost
const calculatePaperCost = (size, quantity, gsm, pages, isCover = false) => {
  const sheetsPerLargeSheet = {
    A3: 2,
    A4: 4,
    A5: 8,
    A6: 16,
    "11x8.5": 4,
    "5.5x8.5": 8,
    "5.5x4.23": 16,
    "B3": 2,
    "B4": 4,
    "B5": 8,
    "B6": 16,
    "B7": 32
  };

  const sps = sheetsPerLargeSheet[size] || 4;
  const sheets = Math.ceil(quantity / sps);
  const dimensionFactor = config.newPaperSizes.includes(size) ? 0.20 : 0.29;
  
  return (sheets * gsm * dimensionFactor * config.paperRate) / 1000;
};

// Helper function to calculate printing cost
const calculatePrintingCost = (sheets, isDoubleSided) => {
  const printingSheets = isDoubleSided ? sheets * 2 : sheets;
  const plateCost = config.plateCost4C;
  const costPer1000 = config.printingCostPer1000_4C;
  
  let printingVariable = 0;
  if (printingSheets > 1000) {
    const blocksNeeded = Math.ceil((printingSheets - 1000) / 1000);
    printingVariable = blocksNeeded * costPer1000;
  }

  return plateCost + printingVariable;
};

// Helper function to calculate lamination cost
const calculateLaminationCost = (laminationType, sheets, size) => {
  if (!laminationType || laminationType === "None") return 0;
  
  const isNewSize = config.newPaperSizes.includes(size);
  const baseRate = isNewSize 
    ? config.newSizeLaminationRates[laminationType] || 0
    : config.laminationRates[laminationType] || 0;
  
  if (!baseRate) return 0;

  return sheets * baseRate;
};

// Helper function to calculate binding cost
const calculateBindingCost = (binding, pages, size, quantity) => {
  let cost = 0;
  switch (binding) {
    case "staple":
      cost = pages <= 20 ? 2 : 2 + (pages - 20) * 0.1;
      break;
    case "spiral":
    case "wiro":
      cost = 15;
      break;
    case "perfect":
      cost = pages <= 50 
        ? 6 
        : 6 + Math.ceil((pages - 50) / 8) * 0.5;
      break;
    default:
      cost = 0;
  }
  return cost * quantity;
};

// Calculate brochure cost
const calculateBrochureCost = async (params) => {
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
  } = params;

  // Calculate paper costs
  const coverPages = 4; // Cover always has 4 pages
  const insidePages = Math.max(totalPages - coverPages, 0);
  
  const coverPaperCost = calculatePaperCost(size, quantity, coverGSM, coverPages, true);
  const insidePaperCost = calculatePaperCost(size, quantity, insideGSM, insidePages, false);
  const paperCost = coverPaperCost + insidePaperCost;

  // Calculate printing costs
  const sheetsPerLargeSheet = {
    A3: 2,
    A4: 4,
    A5: 8,
    A6: 16,
    "11x8.5": 4,
    "5.5x8.5": 8,
    "5.5x4.23": 16,
    "B3": 2,
    "B4": 4,
    "B5": 8,
    "B6": 16,
    "B7": 32
  };

  const sps = sheetsPerLargeSheet[size] || 4;
  const sheets = Math.ceil(quantity / sps);
  const printingCost = calculatePrintingCost(sheets, true);

  // Calculate lamination costs
  const coverLaminationCost = calculateLaminationCost(coverLamination, sheets, size);
  const insideLaminationCost = calculateLaminationCost(insideLamination, sheets, size);
  const laminationCost = coverLaminationCost + insideLaminationCost;

  // Calculate binding cost
  const bindingCost = calculateBindingCost(binding, totalPages, size, quantity);

  // Calculate spot UV cost
  let spotUVCost = 0;
  if (spotUV && spotUV !== "None") {
    const spotUVSheets = spotUV === "Full Book" ? sheets * 2 : sheets;
    spotUVCost = Math.max(spotUVSheets * config.spotUVRate, config.spotUVMinimum);
  }

  // Calculate coating cost
  let coatingCost = 0;
  if (coating && coating !== "None") {
    const coatingSheets = sheets * 2;
    coatingCost = Math.max(coatingSheets * config.coatingRate, config.coatingMinimum);
  }

  // Calculate drip off cost
  let dripOffCost = 0;
  if (dripOff && dripOff !== "None") {
    const doPages = dripOff === "Only Cover" ? coverPages : totalPages;
    const doSheets = dripOff === "Only Cover" ? sheets : sheets * 2;
    const platesNeeded = Math.ceil(doPages / 4);
    let totalDoCost = 0;
    let leftover = doPages;
    
    for (let i = 0; i < platesNeeded; i++) {
      const pagesThisPlate = leftover >= 4 ? 4 : leftover;
      leftover -= pagesThisPlate;
      const fraction = pagesThisPlate / doPages;
      const doSheetsThisPlate = fraction * doSheets;
      const variableCost = config.dripOffRate * doSheetsThisPlate;
      const costForPlate = Math.max(config.dripOffMinimum, variableCost);
      totalDoCost += costForPlate;
    }
    dripOffCost = totalDoCost;
  }

  // Calculate total cost
  const totalCost = paperCost + printingCost + bindingCost + laminationCost + spotUVCost + dripOffCost + coatingCost;
  const totalCostWithGST = totalCost * 1.18;

  return {
    paperCost,
    printingCost,
    bindingCost,
    laminationCost,
    spotUVCost,
    dripOffCost,
    coatingCost,
    totalCost,
    totalCostWithGST
  };
};

// Calculate book cost (similar to brochure but with some differences)
const calculateBookCost = async (params) => {
  // For now, use the same calculation as brochure
  // In the future, we can add book-specific calculations
  return calculateBrochureCost(params);
};

module.exports = {
  calculateBrochureCost,
  calculateBookCost
}; 