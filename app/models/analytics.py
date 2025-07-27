"""
SQLAlchemy models for the analytics service.
"""

from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from .base import Base


class StudentModuleProgress(Base):
    __tablename__ = "student_module_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    workshop_id = Column(Integer, nullable=False)
    modules_completed = Column(Integer, nullable=False)
    percent_complete = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=False), server_default=func.now(), onupdate=func.now())


class QuizScoresSummary(Base):
    __tablename__ = "quiz_scores_summary"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    quiz_id = Column(Integer, nullable=False)
    average_score = Column(Float, nullable=False)
    pass_fail = Column(Boolean, nullable=False)


class LoginActivity(Base):
    __tablename__ = "login_activity"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    device_info = Column(String(255), nullable=True)
    last_login = Column(DateTime(timezone=False), server_default=func.now())
    login_count = Column(Integer, default=1)


class AtRiskStudent(Base):
    __tablename__ = "at_risk_students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    risk_score = Column(Float, nullable=False)
    flagged_reason = Column(String(255), nullable=True)
    flagged_by = Column(Integer, nullable=True)