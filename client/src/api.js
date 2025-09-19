import axios from 'axios';

// In production, use the same domain for API calls
// In development, use the specified API URL or default to localhost:5001
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/admin' // Use admin path in production
  : (process.env.REACT_APP_API_URL || 'http://localhost:5001');

console.log('API URL:', API_URL); // Debug log

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url); // Debug log
    return config;
  },
  (error) => {
    console.error('Request error:', error); // Debug log
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status); // Debug log
    
    // Check if the response content type is JSON
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Unexpected content type: ${contentType}`);
      
      // If the response is not JSON but we have data, try to parse it
      if (typeof response.data === 'string') {
        try {
          response.data = JSON.parse(response.data);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', response.data);
          // Don't throw here, let the calling function handle it
        }
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      // Try to extract useful information from HTML responses
      if (error.response.headers['content-type'] && 
          error.response.headers['content-type'].includes('text/html') && 
          typeof error.response.data === 'string') {
        
        // Try to find JSON in the HTML
        const jsonMatch = error.response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedJson = JSON.parse(jsonMatch[0]);
            console.log('Extracted JSON from HTML response:', extractedJson);
            error.extractedData = extractedJson;
          } catch (e) {
            console.error('Failed to parse extracted JSON:', e);
          }
        }
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const getConfig = async () => {
  try {
    console.log('Fetching config from server...');
    const response = await api.get('/api/config');
    console.log('Config fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching config:', error);
    
    // If we extracted JSON data from an HTML response, use it
    if (error.extractedData) {
      console.log('Using extracted data from error response');
      return error.extractedData;
    }
    
    // Try to fetch the fallback config file
    try {
      console.log('Fetching fallback config file...');
      const fallbackResponse = await fetch('/fallback-config.json');
      if (fallbackResponse.ok) {
        const fallbackConfig = await fallbackResponse.json();
        console.log('Using fallback config file:', fallbackConfig);
        return fallbackConfig;
      }
    } catch (fallbackError) {
      console.error('Error fetching fallback config:', fallbackError);
    }
    
    // Fallback to default config if all else fails
    console.log('Using hardcoded default config');
    return getDefaultConfig();
  }
};

export const updateConfig = async (config) => {
  try {
    // Ensure we're using the correct URL without trailing slash
    const url = '/api/config';
    console.log(`Updating config on server at ${url}:`, config);
    const response = await api.put(url, config);
    console.log('Config updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating config:', error);
    
    // If we extracted JSON data from an HTML response, use it
    if (error.extractedData) {
      console.log('Using extracted data from error response');
      return error.extractedData;
    }
    
    // If update fails, return the original config
    console.log('Update failed, returning original config');
    return config;
  }
};

// Default config to use as fallback
function getDefaultConfig() {
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
    },
    newSizePlateCostPer1000_4C: 350,
    newSizeCostPer1000_1C: 180
  };
}

export const calculate = async (data) => {
  try {
    const response = await api.post('/api/calculate', data);
    return response.data;
  } catch (error) {
    console.error('Error calculating:', error);
    throw error;
  }
};

export const convertFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/conversion', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
};