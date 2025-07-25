# Jabi Learning Platform – Complete Microservices Project

This repository provides a multi‑service implementation of the Jabi Learning Platform.  It contains two independent FastAPI microservices and a React front‑end.  Each service has its own PostgreSQL database, and the front‑end communicates with the services via configurable API base URLs.

## Services

### auth_service

Handles user registration, login, JWT token issuance and basic profile management.  Passwords are securely hashed with bcrypt, and JWTs are signed using a secret key.  The API exposes routes under `/auth`.

### workshop_service

Manages workshops, sections, quiz questions and student progress.  Trainers and admins can create workshops, add sections and questions, and track student completion.  The API exposes routes under `/workshops`.

### frontend

A React application that provides a user interface for students, trainers and administrators.  It reads API base URLs from `.env` (e.g. `REACT_APP_AUTH_API_URL` and `REACT_APP_WORKSHOP_API_URL`) and uses them to authenticate users and manage workshop content.

## Getting Started

Refer to the `instruction.md` guide at the repository root for detailed setup instructions.  In summary:

1. Prepare PostgreSQL databases (one for each service).
2. Set environment variables `DATABASE_URL` and `JWT_SECRET_KEY` when running the services.
3. Install dependencies and start each FastAPI service via Uvicorn.
4. Configure the front‑end `.env` file with the correct API URLs, install dependencies, and run `npm start`.

See `auth_service/README.md` and `workshop_service/README.md` for service‑specific details.