"""
Database utilities for the workshop microservice.

This module sets up the SQLAlchemy engine and session factory using a
PostgreSQL connection string. The connection URL can be configured via
the ``DATABASE_URL`` environment variable. If not provided, it
defaults to a local PostgreSQL instance for development.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# ✅ Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/jabi_workshop_db"
)

# ✅ Debugging print (remove in production)
print("🔍 Workshop Service connecting to:", DATABASE_URL)

# ✅ Create SQLAlchemy engine and session
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Yield a database session for use with FastAPI dependencies."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
