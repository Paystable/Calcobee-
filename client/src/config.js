// Default configuration for the calculator
const defaultConfig = {
  // Paper rates
  paperRate: 100,
  
  // Printing rates
  plateCost4C: 2000,
  newSizePlateCost4C: 2500,
  plateCost1C: 1000,
  newSizePlateCost1C: 1500,
  printingCostPer1000_4C: 300,
  printingCostPer1000_1C: 150,
  
  // Lamination rates
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
  
  // Finishing rates
  spotUVRate: 2.5,
  spotUVMinimum: 3500,
  dripOffRate: 2.5,
  dripOffMinimum: 4500,
  coatingRate: 1.2,
  coatingMinimum: 500,
  
  // Binding rates
  bindingRates: {
    "none": 0,
    "staple": 2,
    "spiral": 15,
    "wiro": 15,
    "perfect": 25,
  },
};

// Load config from localStorage or use default
const loadConfig = () => {
  try {
    const savedConfig = localStorage.getItem('calculatorConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return defaultConfig;
};

// Save config to localStorage
const saveConfig = (config) => {
  try {
    localStorage.setItem('calculatorConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving config:', error);
  }
};

export { defaultConfig, loadConfig, saveConfig }; 