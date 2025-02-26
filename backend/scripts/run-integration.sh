#!/bin/bash

# Ensure PostgreSQL is running
echo '🟡 - Ensuring PostgreSQL is running...'
sudo systemctl start postgresql
sudo systemctl enable postgresql  # To make sure it starts on boot

# Wait for the PostgreSQL database to be ready
echo '🟡 - Waiting for database to be ready...'
./scripts/wait-for-it.sh "postgresql://postgres:password@localhost:5433/webapp" -- echo '🟢 - Database is ready!'

# Run Prisma migrations (Prisma will read DATABASE_URL from .env)
echo '🟡 - Running Prisma migrations...'
npx prisma migrate dev --name init

# Run tests
echo '🟡 - Running tests...'
npm run test

# Stop PostgreSQL after tests
echo '🟡 - Stopping PostgreSQL...'
sudo systemctl stop postgresql