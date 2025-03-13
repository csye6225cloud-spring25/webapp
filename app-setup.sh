#!/bin/bash
set -e

echo "=== Setting up the application ==="

# Create the app directory if it doesn't exist
sudo mkdir -p /opt/app 

# Unzip the application artifact
sudo unzip -o /tmp/backend.zip -d /opt/app/backend

# Ensure csye6225 has a home directory and it's owned by csye6225
sudo mkdir -p /home/csye6225
sudo chown -R csye6225:csye6225 /home/csye6225

# Change ownership of the app directory to csye6225
sudo chown -R csye6225:csye6225 /opt/app

# Install Node.js dependencies as csye6225 user
echo "=== Installing Node.js dependencies ==="
sudo -u csye6225 bash -c "cd /opt/app/backend && npm install"

# Ensure Prisma has execution permissions
sudo chmod +x /opt/app/backend/node_modules/.bin/prisma

# Run Prisma Migrations as csye6225 user
echo "=== Running Prisma Migrations ==="
sudo -u csye6225 bash -c "cd /opt/app/backend && npx prisma migrate deploy"

echo "=== Application setup completed successfully ==="
