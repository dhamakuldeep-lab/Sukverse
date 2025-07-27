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
    subsections = relationship("SubSection", back_populates="section", cascade="all, delete-orphan")


class SubSection(Base):
    __tablename__ = "subsections"
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content_type = Column(String(50), default="content")  # content, quiz, ppt, code
    content_url = Column(String(255), nullable=True)
    order = Column(Integer)

    section = relationship("Section", back_populates="subsections")
    questions = relationship("QuizQuestion", back_populates="subsection", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(Integer, primary_key=True, index=True)
    subsection_id = Column(Integer, ForeignKey("subsections.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    answer = Column(String(2), nullable=False)  # e.g., 'A'
    explanation = Column(Text, nullable=True)

    subsection = relationship("SubSection", back_populates="questions")


class StudentSubProgress(Base):
    __tablename__ = "student_sub_progress"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    subsection_id = Column(Integer, ForeignKey("subsections.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=False))


class FinalQuizStatus(Base):
    __tablename__ = "final_quiz_status"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, nullable=False)
    score = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False)
    passed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    certificate_url = Column(String(255), nullable=True)


class PlatformSurvey(Base):
    __tablename__ = "platform_survey"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, nullable=False)
    interested_courses = Column(JSON, nullable=True)
    email = Column(String(100))
    whatsapp = Column(String(20))
    feedback = Column(Text, nullable=True)
    rating = Column(Integer)


def init_db():
    from .database import engine  # local import to avoid circular dependency
    Base.metadata.create_all(bind=engine)
