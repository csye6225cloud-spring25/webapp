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

# ASSIGNMENT 4 - Packer & Custom Images

## Overview

Implemented Packer to build a custom application image using Ubuntu 24.04 LTS. The image includes all dependencies, databases, and application binaries.

## Requirements

- Implemented Ubuntu 24.04 LTS as the base image.
- Installed MySQL/MariaDB/PostgreSQL locally.
- Included necessary dependencies and application binaries.
- Ensured built images are private.
- Configured builds in the default VPC of DEV AWS and DEV GCP.
- Stored Packer template in the web application repository.

## CI with GitHub Actions

### Status Check Workflow

- Implemented `packer fmt` to enforce formatting.
- Implemented `packer validate` to ensure validation.
- Triggered on pull requests.

### Custom Image Build Workflow

- Triggered only on pull request merges.
- Implemented integration tests before the build.
- Built the application artifact separately.
- Copied artifact into the custom image.
- Built custom image in AWS and GCP in parallel.
- Created local user `csye6225` with no login shell.
- Installed dependencies and copied required files.
- Configured systemd for application startup.
- Ensured failure at any step prevents image build.

## IAM and Security Configuration

- Created IAM service accounts for GitHub Actions in AWS and GCP.
- Assigned necessary roles and permissions.
- Configured AWS CLI and GCP SDK on GitHub Actions runner.

## Infrastructure with Terraform

### Application Security Group

- Implemented a security group for EC2 instances.
- Allowed TCP traffic on ports 22, 80, 443, and the application port.
- Attached security group to EC2 instances.

### EC2 Instance Configuration

- Launched EC2 instance in Terraform-created VPC.
- Attached application security group.
- Configured EBS volumes to terminate on instance deletion.
- Instance specifications:
  - Used the custom AMI.
  - Disabled accidental termination protection.
  - Set root volume size to 25 GB, type GP2.

Ensured automated and structured deployment of secure and efficient custom images with Terraform and Packer.


# ASSIGNMENT 5 - Cloud-Based Web Application

## Overview

This is a Node.js web application deployed on AWS using EC2, RDS, and S3. The infrastructure is provisioned with Terraform, and a custom AMI is built using Packer. The app provides API endpoints for health checks and file management.

## Prerequisites

- An AWS account with appropriate permissions
- Terraform installed on your machine
- Packer installed on your machine
- Node.js and npm installed
- Prisma CLI installed

## Setup Instructions

1. **Clone the Repository**  
   Clone the repo with git clone <repository-url> and navigate into it with cd <repository-directory>.

2. **Configure AWS Credentials**  
   Set up your AWS credentials in ~/.aws/credentials or use environment variables.

3. **Build the AMI**  
   Navigate to the packer directory with cd packer, then run packer build -var 'build_timestamp=$(date +%s)' template.pkr.hcl to create the custom AMI.

4. **Deploy Infrastructure**  
   Move to the terraform directory with cd ../terraform, initialize with terraform init, and deploy with terraform apply -var 'db_password=<your-db-password>'.

5. **Access the App**  
   Once deployed, use the public IP of the EC2 instance to access the API endpoints.

## API Endpoints

- **GET /healthz**  
  Returns a 200 status if the app is healthy, or 503 if the database connection fails.
- **POST /v1/file**  
  Uploads a file to S3 and stores its metadata in RDS.
- **GET /v1/file?id=<file-id>**  
  Retrieves metadata for a specific file using its ID.
- **DELETE /v1/file/<file-id>**  
  Deletes a file from S3 and its metadata from RDS.

## Key Components

- **Packer**: Builds a custom AMI with the application pre-installed.
- **Terraform**: Provisions the VPC, RDS, S3, and EC2 resources.
- **Node.js**: Runs the API and connects to RDS and S3.
- **Prisma**: Handles database schema management and migrations.
- **Systemd**: Ensures the app starts automatically on the EC2 instance.

## Security

- RDS is configured as a private resource.
- S3 uses server-side encryption for stored files.
- EC2 runs the app as a non-privileged user.
- Credentials are securely passed to EC2 via user data.

## Troubleshooting

- Check /var/log/user_data.log on the EC2 instance for startup errors.
- Ensure the RDS instance is running and accessible.
- Verify the EC2 instance’s IAM role has the necessary S3 permissions.

