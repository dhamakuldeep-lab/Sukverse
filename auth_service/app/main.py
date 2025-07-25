"""
Entry point for the Jabi Auth Service.

Initialises the FastAPI application, sets up database tables and
includes the authentication routes.  CORS is enabled to allow the
front‑end to access the API from a different origin.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db.database import engine
from .db.models import Base
from .api.routes_auth import router as auth_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Jabi Auth Service",
    description="Handles user registration and authentication for the Jabi Learning Platform.",
    version="1.0.0",
)

# Enable CORS for all origins (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)


@app.get("/ping-db", tags=["Health Check"])
def ping_db():
    """Simple health check to ensure the service is running."""
    return {"status": "✅ Auth service is running"}