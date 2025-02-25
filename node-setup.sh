#!/bin/bash
set -e

echo "=== Installing Node.js System-Wide ==="

# Install required dependencies
sudo apt update
sudo apt install -y curl ca-certificates

# Add Node.js repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm globally
sudo apt install -y nodejs

# Verify installation
echo "Node.js Version: $(node -v)"
echo "NPM Version: $(npm -v)"

# Ensure node and npm are accessible to all users
sudo ln -sf /usr/bin/node /usr/local/bin/node
sudo ln -sf /usr/bin/npm /usr/local/bin/npm
