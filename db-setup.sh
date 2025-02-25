#!/bin/bash

echo "Installing PostgreSQL..."
sudo apt update -y
sudo apt install -y postgresql postgresql-contrib unzip

echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable auto-start on boot

# Configure PostgreSQL
echo "Configuring PostgreSQL..."

# Set PostgreSQL user password
echo "Setting PostgreSQL user password..."
sudo -u postgres psql -c "ALTER USER $DB_USER PASSWORD '$DB_PASSWORD';"

echo "Creating PostgreSQL user '$DB_USER' with password..."
# Create user if it doesn't exist
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

echo "Creating database '$DB_NAME' and granting privileges..."
# Create database if it doesn't exist
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "Granting privileges to '$DB_USER' on '$DB_NAME'..."
# Grant privileges to the user on the database
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"