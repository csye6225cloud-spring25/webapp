#!/bin/bash
set -e

echo "=== Setting up the application ==="

# Create the app directory if it doesn't exist
sudo mkdir -p /opt/app 

sudo apt install -y unzip

# Unzip the application artifact
sudo unzip -o /tmp/backend.zip -d /opt/app/backend


# This wont work now as we have to create the RDS and use that endpoint dynamically

# Create the .env file dynamically with the DATABASE_URL passed from Packer 
# echo "DATABASE_URL=${DATABASE_URL}" | sudo tee /opt/app/backend/.env

# Ensure csye6225 has a home directory and it's owned by csye6225
sudo mkdir -p /home/csye6225
sudo chown -R csye6225:csye6225 /home/csye6225 

# Change ownership of the app directory to csye6225
sudo chown -R csye6225:csye6225 /opt/app

# Clear npm cache
echo "=== Clearing npm cache ==="
sudo -u csye6225 bash -c "cd /opt/app/backend && npm cache clean --force"

# Remove node_modules and package-lock.json
# echo "=== Removing existing node_modules and package-lock.json ==="
# sudo -u csye6225 bash -c "cd /opt/app/backend && rm -rf node_modules package-lock.json"

# Install Node.js dependencies
echo "=== Installing Node.js dependencies ==="
sudo -u csye6225 bash -c "cd /opt/app/backend && npm install"


# Donot migrate here, migrate in terraform by sharing creds dynamically

# # Generate the Prisma client
# echo "=== Generating Prisma Client ==="
# sudo -u csye6225 bash -c "cd /opt/app/backend && npx prisma generate"

# # Ensure Prisma has execution permissions
# sudo chmod +x /opt/app/backend/node_modules/.bin/prisma

# # Run Prisma Migrations
# echo "=== Running Prisma Migrations ==="
# sudo -u csye6225 bash -c "cd /opt/app/backend && npx prisma migrate deploy"

