#!/bin/bash

DB_NAME="webapp"
LINUX_GROUP="webappgroup"
LINUX_USER="onerahul"
APP_DIR="/opt/csye6225"
ZIP_FILE="/tmp/webapp.zip"

echo "Updating package lists..."
sudo apt update -y

echo "Upgrading installed packages..."
sudo apt upgrade -y

echo "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib unzip

echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot as well

echo "Creating the '$DB_NAME' database..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database '$DB_NAME' already exists."

echo "Creating the '$LINUX_GROUP' group..."
sudo groupadd $LINUX_GROUP 2>/dev/null || echo "Group '$LINUX_GROUP' already exists."

echo "Creating the '$LINUX_USER' user and adding to '$LINUX_GROUP' group..."
sudo useradd -m -g $LINUX_GROUP $LINUX_USER 2>/dev/null || echo "User '$LINUX_USER' already exists."

echo "Creating application directory..."
sudo mkdir -p $APP_DIR

echo "Setting permissions for the application directory..."
sudo chown -R $LINUX_USER:$LINUX_GROUP $APP_DIR
sudo chmod -R 755 $APP_DIR

echo "Checking if zip file exists in /tmp/..."
if [ -f "$ZIP_FILE" ]; then
    echo "Extracting application to $APP_DIR..."
    sudo unzip -o $ZIP_FILE -d $APP_DIR
    # echo "Cleaning up zip file..."
    # rm $ZIP_FILE
    echo "Application extracted successfully."
else
    echo "No zip file found in /tmp/. Please copy the webapp.zip file and rerun the script."
    exit 1
fi

echo "Setup complete. The application is ready to use."

