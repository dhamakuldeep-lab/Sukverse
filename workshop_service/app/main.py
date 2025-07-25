"""
Entry point for the workshop microservice.

This file initializes a FastAPI application, sets up the database,
includes the workshop router and provides a health check endpoint.
"""

import os
import logging.config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

from .db.models import init_db
from .api.routes_workshop import router as workshop_router
from .db.database import engine

# Create tables on startup
init_db()

app = FastAPI(
    title="Jabi Workshop Service",
    description="Manages workshops, sections, quizzes and student progress.",
    version="1.0.0",
)

# Enable CORS so that the front‑end running on a different origin can communicate with this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the workshop router
app.include_router(workshop_router)


@app.get("/ping-db", tags=["Health Check"])
def ping_db():
    """
    Tests if the database is reachable. Useful for debugging or readiness probes.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "✅ Database connection successful"}
    except SQLAlchemyError as e:
        return {"status": "❌ Database connection failed", "error": str(e)}