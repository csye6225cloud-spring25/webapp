#!/bin/bash

# Load environment variables from .env file if it exists
set -a
source ./.env
set +a

echo "Updating package lists..."
sudo apt update -y

echo "Upgrading installed packages..."
sudo apt upgrade -y

echo "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib unzip

echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable auto-start on boot

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

echo "Creating the '$LINUX_GROUP' group..."
# Create group if it doesn't exist
sudo groupadd $LINUX_GROUP 2>/dev/null || echo "Group '$LINUX_GROUP' already exists."

echo "Creating the '$LINUX_USER' user and adding to '$LINUX_GROUP' group..."
# Create user if it doesn't exist
sudo useradd -m -g $LINUX_GROUP $LINUX_USER 2>/dev/null || echo "User '$LINUX_USER' already exists."

echo "Creating application directory '$APP_DIR'..."
# Create application directory
sudo mkdir -p $APP_DIR

echo "Setting permissions for the application directory..."
# Set permissions for the application directory
sudo chown -R $LINUX_USER:$LINUX_GROUP $APP_DIR
sudo chmod -R 750 $APP_DIR  # More secure than 755

echo "Checking if zip file '$ZIP_FILE' exists..."
# Check if the zip file exists and extract it
if [ -f "$ZIP_FILE" ]; then
    echo "Extracting application to $APP_DIR..."
    sudo unzip -o $ZIP_FILE -d $APP_DIR
    echo "Application extracted successfully."
else
    echo "No zip file found! Please place the zip file in the script directory and rerun the script."
    exit 1
fi

echo "Setup complete. The application is ready to use."

