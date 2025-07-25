"""
SQLAlchemy models for the workshop microservice.

Defines tables for workshops, sections, quiz questions and student
progress.  Relationships are set up via foreign keys.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, declarative_base


Base = declarative_base()


class Workshop(Base):
    __tablename__ = "workshops"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    trainer_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

    sections = relationship("Section", back_populates="workshop", cascade="all, delete-orphan")


class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    title = Column(String(200), nullable=False)
    ppt_url = Column(String(255), nullable=True)
    code = Column(Text, nullable=True)

    workshop = relationship("Workshop", back_populates="sections")
    questions = relationship("QuizQuestion", back_populates="section", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    answer = Column(String(2), nullable=False)  # e.g., 'A'
    explanation = Column(Text, nullable=True)

    section = relationship("Section", back_populates="questions")


class StudentProgress(Base):
    __tablename__ = "student_progress"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=False))


def init_db():
    """
    Create all tables in the database.  This function is imported in
    ``main.py`` and called at application startup.  It imports the
    database engine lazily to avoid circular imports.
    """
    from .database import engine  # local import to avoid circular dependency
    Base.metadata.create_all(bind=engine)