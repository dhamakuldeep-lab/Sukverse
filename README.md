# Jabi Learning Platform – Microservices Architecture

This repository contains a collection of independent FastAPI services and a React frontend. Each service owns its own PostgreSQL database and communicates with others via REST or events. The new structure enforces clear boundaries and avoids duplication of user data.

## Services
- **auth_service** – Handles login, registration and role based access.
- **user_service** – Admin CRUD interface for user profiles and CSV uploads.
- **workshop_service** – Manages workshops, steps and learner progress.
- **quiz_service** – Reusable quiz engine shared across the platform.
- **analytics_service** – Consumes events and generates learning insights.
- **certificate_service** – Issues certificates when completion criteria are met.
- **frontend** – React UI consuming the APIs.

Each service follows the folder pattern:
```
service_name/
  app/
    routes/
    models/
    schemas/
    services/
    utils/
    middleware/
  main.py
  Dockerfile
  requirements.txt
  .env
```

## Running Locally
Use Docker Compose to spin up all services along with individual PostgreSQL instances:
```bash
docker-compose up --build
```
Adjust the environment variables in each `.env` file if running without Docker.

