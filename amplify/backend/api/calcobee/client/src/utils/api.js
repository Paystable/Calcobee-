// API utility functions

// Base API URL - use current origin in production, development server in dev
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5001';

// Get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

// Get the current domain
export const getCurrentDomain = () => {
  return API_BASE_URL;
};

// Fetch config from the API
export const fetchConfig = async () => {
  try {
    // First try to fetch from the API
    const url = getApiUrl('/api/config');
    console.log('Fetching config from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Unexpected content type:', contentType);
      // Try to parse as JSON anyway
      try {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          return data;
        } catch (e) {
          console.error('Failed to parse response as JSON:', text);
          throw new Error('Invalid response format');
        }
      } catch (e) {
        throw new Error('Failed to read response');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching config from API:', error);
    // If API fails, try to fetch from static file
    try {
      const staticResponse = await fetch('/api/config/index.json');
      if (!staticResponse.ok) {
        throw new Error(`HTTP error! status: ${staticResponse.status}`);
      }
      return await staticResponse.json();
    } catch (staticError) {
      console.error('Error fetching static config:', staticError);
      // If both fail, return default config
      return {
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
    }
  }
};

// Update config through the API
export const updateConfig = async (configData) => {
  try {
    const url = getApiUrl('/api/config');
    console.log('Updating config at:', url);
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
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Unexpected content type:', contentType);
      // Try to parse as JSON anyway
      try {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          return data;
        } catch (e) {
          console.error('Failed to parse response as JSON:', text);
          throw new Error('Invalid response format');
        }
      } catch (e) {
        throw new Error('Failed to read response');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating config:', error);
    // If API update fails, save to localStorage as fallback
    localStorage.setItem('calculatorConfig', JSON.stringify(configData));
    throw error; // Re-throw to let the caller handle the error
  }
}; 