#!/bin/bash

# Exit on error
set -e

echo "Starting Calcobee build process..."

# Print current directory and contents
ROOT_DIR=$(pwd)
echo "Current directory: $ROOT_DIR"
echo "Directory contents:"
ls -la

# Check for client directory
if [ -d "/Users/yash/Desktop/Calcobee-2/client" ]; then
  CLIENT_DIR="/Users/yash/Desktop/Calcobee-2/client"
  echo "Found client directory at absolute path: $CLIENT_DIR"
elif [ -d "client" ]; then
  CLIENT_DIR="$ROOT_DIR/client"
  echo "Found client directory in current directory: $CLIENT_DIR"
else
  echo "Error: Client directory not found!"
  exit 1
fi

# Check for server directory
if [ -d "/Users/yash/Desktop/Calcobee-2/server" ]; then
  SERVER_DIR="/Users/yash/Desktop/Calcobee-2/server"
  echo "Found server directory at absolute path: $SERVER_DIR"
elif [ -d "server" ]; then
  SERVER_DIR="$ROOT_DIR/server"
  echo "Found server directory in current directory: $SERVER_DIR"
else
  echo "Error: Server directory not found!"
  exit 1
fi

# Create build directories
echo "Creating build directories..."
mkdir -p "$ROOT_DIR/build/client"
mkdir -p "$ROOT_DIR/build/server"

# Build client
echo "Building client..."
cd "$CLIENT_DIR"
npm install
npm run build
echo "Copying client build files..."
cp -r build/* "$ROOT_DIR/build/client/"

# Build server
echo "Building server..."
cd "$SERVER_DIR"
npm install
npm run build || echo "No build step required for server"
echo "Copying server files..."
cp -r * "$ROOT_DIR/build/server/"

# Return to root directory
cd "$ROOT_DIR"

echo "Build completed successfully!"
echo "Final build directory contents:"
ls -la build
ls -la build/client
ls -la build/server

exit 0