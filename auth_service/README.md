# Jabi Auth Service

This microservice provides user registration, login and basic profile management for the Jabi Learning Platform.  It uses FastAPI, SQLAlchemy and JWT for stateless authentication.

## Running the Service

1. Ensure PostgreSQL is running and create a database for the auth service (default is `jabi_auth`).
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment variables as needed:
   * `DATABASE_URL` – PostgreSQL connection string (e.g. `postgresql+psycopg2://postgres:postgres@localhost:5432/jabi_auth`)
   * `JWT_SECRET_KEY` – Secret key used to sign tokens (default: `change_this_secret`)
   * `JWT_ALGORITHM` – JWT signing algorithm (default: `HS256`)
4. Run the service:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

All routes are prefixed with `/auth`.

| Method & Path       | Description                              |
|---------------------|------------------------------------------|
| `POST /auth/register` | Create a new user account.               |
| `POST /auth/login`    | Authenticate and receive JWT tokens.     |
| `GET /auth/me`        | Retrieve the current authenticated user. |
| `PUT /auth/update-profile` | Update email, username or picture. |
| `PUT /auth/change-password` | Change the current user’s password. |
| `POST /auth/forgot-password` | Initiate password reset flow.   |
| `POST /auth/reset-password`  | Reset password with a token.    |
| `POST /auth/refresh-token`   | Obtain a new access token.       |
| `POST /auth/logout`          | Logout (stateless).               |

See the OpenAPI documentation at `/docs` for details on request and response models.