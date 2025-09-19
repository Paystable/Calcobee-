const crypto = require('crypto');
const { promisify } = require('util');
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Promisify Redis methods
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Generate a new API key
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create a new API key for a business
const createApiKey = async (businessId, businessName, expiresIn = '30d') => {
  const apiKey = generateApiKey();
  const keyData = {
    businessId,
    businessName,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  };

  await setAsync(`api_key:${apiKey}`, JSON.stringify(keyData), 'EX', 30 * 24 * 60 * 60); // 30 days TTL
  return apiKey;
};

// Get API key information
const getApiKey = async (apiKey) => {
  const keyData = await getAsync(`api_key:${apiKey}`);
  if (!keyData) return null;
  
  const data = JSON.parse(keyData);
  if (new Date(data.expiresAt) < new Date()) {
    await delAsync(`api_key:${apiKey}`);
    return null;
  }
  
  return data;
};

// Revoke an API key
const revokeApiKey = async (apiKey) => {
  await delAsync(`api_key:${apiKey}`);
};

// List all API keys for a business
const listApiKeys = async (businessId) => {
  const keys = await redisClient.keys('api_key:*');
  const apiKeys = [];
  
  for (const key of keys) {
    const data = await getAsync(key);
    if (data) {
      const keyData = JSON.parse(data);
      if (keyData.businessId === businessId) {
        apiKeys.push({
          apiKey: key.replace('api_key:', ''),
          ...keyData
        });
      }
    }
  }
  
  return apiKeys;
};

module.exports = {
  createApiKey,
  getApiKey,
  revokeApiKey,
  listApiKeys
}; 