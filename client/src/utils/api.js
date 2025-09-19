// API utility functions

// Base API URL - use current origin in production, development server in dev
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `${window.location.origin}/admin` // Add /admin path in production
  : 'http://localhost:5001';

// Get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with a slash and doesn't end with a slash
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  normalizedEndpoint = normalizedEndpoint.endsWith('/') ? normalizedEndpoint.slice(0, -1) : normalizedEndpoint;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

// Get the current domain
export const getCurrentDomain = () => {
  return API_BASE_URL;
};

// Buffer key for storing config
const CONFIG_BUFFER_KEY = 'calculatorConfigBuffer';

// Fetch config from the API
export const fetchConfig = async () => {
  try {
    // First try to fetch from the API
    const url = getApiUrl('/api/config');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      // Silently fall back to buffer
      const bufferedConfig = localStorage.getItem(CONFIG_BUFFER_KEY);
      if (bufferedConfig) {
        return JSON.parse(bufferedConfig);
      }
      throw new Error('Failed to fetch config');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Silently fall back to buffer
      const bufferedConfig = localStorage.getItem(CONFIG_BUFFER_KEY);
      if (bufferedConfig) {
        return JSON.parse(bufferedConfig);
      }
      throw new Error('Invalid response format');
    }

    const data = await response.json();
    // Update buffer with successful API response
    localStorage.setItem(CONFIG_BUFFER_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    // Silently try to load from buffer
    const bufferedConfig = localStorage.getItem(CONFIG_BUFFER_KEY);
    if (bufferedConfig) {
      try {
        return JSON.parse(bufferedConfig);
      } catch (e) {
        // If buffer is corrupted, return default config
        return getDefaultConfig();
      }
    }
    // If no buffer, return default config
    return getDefaultConfig();
  }
};

// Default config to use when API and buffer fail
const getDefaultConfig = () => ({
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
});

// Update config through the API
export const updateConfig = async (configData) => {
  try {
    const url = getApiUrl('/api/config');
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(configData),
    });
    
    if (!response.ok) {
      // Silently save to buffer and return the config
      localStorage.setItem(CONFIG_BUFFER_KEY, JSON.stringify(configData));
      return configData;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Silently save to buffer and return the config
      localStorage.setItem(CONFIG_BUFFER_KEY, JSON.stringify(configData));
      return configData;
    }

    const data = await response.json();
    // Update buffer with successful API response
    localStorage.setItem(CONFIG_BUFFER_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    // Silently save to buffer and return the config
    localStorage.setItem(CONFIG_BUFFER_KEY, JSON.stringify(configData));
    return configData;
  }
};

// Sync buffer with API when available
export const syncBufferWithApi = async () => {
  try {
    const bufferedConfig = localStorage.getItem(CONFIG_BUFFER_KEY);
    if (bufferedConfig) {
      const config = JSON.parse(bufferedConfig);
      await updateConfig(config);
    }
  } catch (error) {
    // Silently fail
  }
}; 