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
  - Response headers include `Cache-Control:

# Assignment 1: Setup Instructions

This document provides step-by-step instructions to set up and run the Health Check API project with database bootstrapping.

---

## Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
2. **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
3. **Git**: [Install Git](https://git-scm.com/downloads)

## Repository URL

`https://github.com/csye6225cloud-spring25/webapp.git`

## Project Setup

```bash
# 1. Clone the Repository
git clone https://github.com/csye6225cloud-spring25/webapp.git


# 2. Set Up Environment Variables
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=webapp
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
DATABASE_URL=postgresql://postgres:password@postgres:5432/webapp

## Setup the .env file in you root folder of webapp

# 3. Start the Application
docker-compose up
```

TO BE CONTINUED ....
