from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from ..database import Base

class StudentModuleProgress(Base):
    __tablename__ = 'student_module_progress'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    workshop_id = Column(Integer)
    modules_completed = Column(Integer)
    percent_complete = Column(Integer)

class QuizScoresSummary(Base):
    __tablename__ = 'quiz_scores_summary'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    quiz_id = Column(Integer)
    average_score = Column(Integer)
    pass_fail = Column(Boolean)

class LoginActivity(Base):
    __tablename__ = 'login_activity'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    device_info = Column(String)
    last_login = Column(DateTime)
    login_count = Column(Integer)

class AtRiskStudent(Base):
    __tablename__ = 'at_risk_students'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    risk_score = Column(Integer)
    flagged_reason = Column(String)
    flagged_by = Column(Integer)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
