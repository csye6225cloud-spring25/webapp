# Assignment 1: Health Check API with Database Bootstrapping

This project is a RESTful API that implements a health check endpoint (`/healthz`) to monitor the health of the application instance. The application automatically bootstraps the database at startup, creating the necessary schema, tables, and sequences.

## Features

- **Database Bootstrapping**: Automatically creates or updates the database schema, tables, and sequences using an ORM framework.
- **Health Check API**: Implements a `/healthz` endpoint to monitor the application's health.
  - Inserts a record into the `health_check` table.
  - Returns `HTTP 200 OK` if the record is inserted successfully.
  - Returns `HTTP 503 Service Unavailable` if the insertion fails.
- **RESTful API Requirements**:
  - All API responses are in JSON.
  - Proper HTTP status codes are returned for all requests.
  - No UI is implemented.
- **Database Table**:
  - `health_check` table with two columns:
    1. `check_id` (Primary Key, auto-incremented using a sequence).
    2. `datetime` (Stores the UTC timestamp of the health check).

## API Endpoint

### `/healthz`

- **Method**: `GET`
- **Description**: Performs a health check by inserting a record into the `health_check` table.
- **Request**:
  - No payload allowed. Returns `HTTP 400 Bad Request` if a payload is provided.
- **Response**:
  - `HTTP 200 OK`: If the record is inserted successfully.
  - `HTTP 503 Service Unavailable`: If the insertion fails.
  - `HTTP 405 Method Not Allowed`: For non-GET methods.
  - Response headers include `Cache-Control`.

---

# Assignment 1: Setup Instructions

This document provides step-by-step instructions to set up and run the Health Check API project with database bootstrapping.

---

## Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Node.js**: [Install Node.js](https://nodejs.org/)
2. **PostgreSQL**: [Install PostgreSQL](https://www.postgresql.org/download/)
3. **Git**: [Install Git](https://git-scm.com/downloads)

## Repository URL

`https://github.com/csye6225cloud-spring25/webapp.git`

## Project Setup

```bash
# 1. Clone the Repository
git clone https://github.com/csye6225cloud-spring25/webapp.git

# 2. Navigate into the backend directory
cd webapp/backend

# 3. Install Dependencies
npm install

## 4. Create a `.env` file

Create a `.env` file in the `backend` folder and add the following configuration:

Environment variables declared in this file are automatically made available to Prisma.
See the documentation for more detail: [Prisma Environment Variables](https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema).
Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
See the documentation for all the connection string options: [Prisma Connection Strings](https://pris.ly/d/connection-strings).

DATABASE_URL = "postgres://postgres:password@localhost:5432/webapp"
```

## 5. Run the Application

Ensure your PostgreSQL server is running locally. Then, run the application using:

```bash
npm run dev
```

This will start the API on [http://localhost:3000](http://localhost:3000).

## 6. Testing the Health Check API

Once the application is up and running, you can test the health check API by following these methods:

### Method 1: Using `curl`

Send a GET request to the `/healthz` endpoint by running the following command in your terminal:

```bash
curl http://localhost:3000/healthz
```

This will start the API on [http://localhost:3000](http://localhost:3000).

### Method 2: Using Postman

1. Open **Postman**.
2. Set the request type to **GET**.
3. Enter the following URL in the request bar: `http://localhost:3000/healthz`.
4. Click **Send**.

You should receive a `HTTP 200 OK` response if the health check is successful.

Test other responses likewise

---

# Assignment 2: Application Setup and Integration Testing

## Part 1: Automating Application Setup with Shell Script

In this part of the assignment, we automate the setup process of the application on Ubuntu 24.04 LTS using a shell script. This script performs the following tasks:

- Updates the package lists for upgrades of packages that need upgrading.
- Installs the required RDBMS (PostgreSQL).
- Creates the database in the selected RDBMS.
- Creates a new Linux group and a user for the application.
- Unzips the application in the `/opt/csye6225` directory.
- Updates the permissions of the folder and its artifacts.

### Shell Script

The script, `script.sh`, is placed inside in the the web app repository and can be executed as follows:

```bash
chmod +x ./script.sh  # Make the script executable
```

```bash
./script.sh #Run the script
```

## Part 2: Integration Testing with Vitest and Supertest

Integration tests are written using **Vitest** and **Supertest** to ensure the application functions as expected.

### Integration Test Script

The script, `run-integration.sh`, is placed inside the `scripts` folder and does the following:

1. **Ensure PostgreSQL is Running**: The script starts PostgreSQL if it's not already running and enables it to start on boot.
2. **Wait for Database Readiness**: The script waits until the PostgreSQL database is ready before proceeding. It uses the `wait-for-it.sh` script to check if the database is accessible.
3. **Run Prisma Migrations**: Prisma migrations are applied by running `npx prisma migrate dev --name init`, which updates the database schema based on your Prisma schema.
4. **Run Tests**: After ensuring the database and migrations are in place, the script runs the integration tests using `npm run test`.
5. **Stop PostgreSQL**: After the tests are completed, the script stops the PostgreSQL service.

### Running Integration Tests

You can run the integration tests by executing the following command:

```bash
npm run test:integration
```

This will invoke the run-integration.sh script and start the process.

# Assignment 3 - Continuous Integration (CI) for Web App

## Objective

In this task, we set up **Continuous Integration (CI)** using **GitHub Actions** to run application tests for every pull request raised. The goal is to ensure that:

1. A pull request can only be merged if the tests pass.
2. The CI pipeline executes successfully for each pull request.
3. **GitHub branch protection** ensures users cannot merge pull requests that fail the CI workflow.

---

## CI Workflow

### **GitHub Actions Workflow**

- The CI pipeline is triggered on **pull requests** made to the `main` branch.
- The workflow performs the following steps:
  1. **Setup PostgreSQL Database**: Installs and configures PostgreSQL for testing.
  2. **Install Dependencies**: Installs the necessary Node.js dependencies.
  3. **Run Prisma Migrations**: Applies any pending database migrations using Prisma.
  4. **Run Tests**: Executes the integration tests that were implemented in the previous assignment.

### **GitHub Status Checks**

- The pull request will only be able to merge **if the CI workflow passes**. This prevents untested code from being merged into the `main` branch.

---

## Steps to Run CI Workflow

1. **Make Changes**: Make changes to your code and push them to a new branch.
2. **Raise a Pull Request**: Create a pull request from your feature branch to `main`.
3. **CI Workflow Runs**: GitHub Actions will trigger the workflow to run your tests.
4. **Merge PR**: If the tests pass, you can merge the pull request.

---
