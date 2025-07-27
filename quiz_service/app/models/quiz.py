from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from ..database import Base

class Quiz(Base):
    __tablename__ = 'quizzes'
    quiz_id = Column(Integer, primary_key=True)
    title = Column(String)
    linked_to = Column(String)
    duration = Column(Integer)

class Question(Base):
    __tablename__ = 'questions'
    question_id = Column(Integer, primary_key=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.quiz_id'))
    content = Column(String)
    type = Column(String)

class Option(Base):
    __tablename__ = 'options'
    option_id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey('questions.question_id'))
    label = Column(String)
    is_correct = Column(Boolean)

class StudentQuizAttempt(Base):
    __tablename__ = 'student_quiz_attempts'
    attempt_id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    quiz_id = Column(Integer)
    started_at = Column(DateTime(timezone=False), server_default=func.now())

class QuizResult(Base):
    __tablename__ = 'quiz_results'
    quiz_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, primary_key=True)
    score = Column(Integer)
    pass_fail = Column(Boolean)
    result_json = Column(JSON)
