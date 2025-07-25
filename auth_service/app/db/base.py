"""
Database base class for SQLAlchemy models.

This module defines a declarative base that all ORM models should inherit
from.  Import Base in your models and call Base.metadata.create_all()
to create tables when the application starts.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()