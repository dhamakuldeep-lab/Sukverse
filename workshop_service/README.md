# Jabi Workshop Service

This microservice manages workshops, sections, quiz questions and student progress for the Jabi Learning Platform.  It uses FastAPI, SQLAlchemy and PostgreSQL.  See `workshop_service/app` for the implementation.

## Running the Service

1. Ensure PostgreSQL is running and create a database for the workshop service (default is `jabi_workshop`).
2. Install dependencies:
   ```bash
   pip install fastapi sqlalchemy psycopg2-binary pydantic uvicorn
   ```
3. Set the environment variable `DATABASE_URL` to your PostgreSQL connection string (e.g. `postgresql+psycopg2://postgres:postgres@localhost:5432/jabi_workshop`).
4. Run the service:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```

The service exposes REST endpoints under `/workshops` for creating, retrieving, updating and deleting workshops, sections and quiz questions.  See the OpenAPI docs at `/docs` for details.