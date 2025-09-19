#!/bin/bash

# Exit on error
set -e

echo "Starting API build process..."

# Print current directory and contents
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm install

# Create production environment file
echo "Setting up environment variables..."
cat > .env.production << EOL
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://calcobee.com
EOL

# Print environment file contents
echo "Environment file contents:"
cat .env.production

# Verify build
echo "Verifying build..."
if [ ! -f "src/index.js" ]; then
    echo "Error: src/index.js not found!"
    exit 1
fi

# Print final directory contents
echo "Final directory contents:"
ls -la

echo "API build completed successfully!"
exit 0 