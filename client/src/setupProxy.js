const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // No rewrite needed
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests
        console.log(`Proxying ${req.method} request to: ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Ensure JSON content type for API responses
        proxyRes.headers['content-type'] = 'application/json';
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          error: 'Proxy error', 
          message: err.message 
        }));
      }
    })
  );
};