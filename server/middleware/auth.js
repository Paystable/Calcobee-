const { getApiKey } = require('../utils/apiKeys');

const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      message: 'Please provide an API key in the X-API-Key header'
    });
  }

  try {
    const isValid = await getApiKey(apiKey);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has expired'
      });
    }

    // Add the API key info to the request for later use
    req.apiKey = apiKey;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: 'Error validating API key',
      message: 'An error occurred while validating the API key'
    });
  }
};

module.exports = {
  validateApiKey
}; 