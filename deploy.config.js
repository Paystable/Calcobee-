module.exports = {
  apps: [
    {
      name: 'calcobee',
      script: 'server/server.js',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        DOMAIN: 'calcobee.com'
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}; 