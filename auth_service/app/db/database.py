"""
Database configuration for the auth service.

This module sets up the SQLAlchemy engine and session factory using
a connection URL supplied via the ``DATABASE_URL`` environment variable.
If no URL is provided, a default PostgreSQL connection string is used.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# ✅ Load environment variables from .env file
load_dotenv()

# ✅ Get the DATABASE_URL from the environment or fallback to default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/jabi_auth_db"
)

# ✅ Print for debugging (remove in production)
print(f"🔍 FastAPI is connecting to: {DATABASE_URL}")

# ✅ Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=False, future=True)

# ✅ Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Base class for ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session
    and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
