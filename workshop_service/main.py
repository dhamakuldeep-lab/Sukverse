"""
Workshop Service
================

This microservice manages workshops, modules, substeps, quizzes, student
progress and analytics for the Jabi platform.  Trainers and admins can
create and manage workshops, while students can join workshops, track
their progress, take quizzes and provide feedback.  The service exposes
RESTful endpoints and stores data in a PostgreSQL database.

Usage
-----
The service requires the environment variable `DATABASE_URL` to point to
a PostgreSQL database.  Tables are created automatically on startup.  This
implementation is stateless; authentication/authorisation is expected to be
handled at the API gateway or by the client passing a valid JWT.
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import (Column, Date, DateTime, ForeignKey, Integer, String,
                        Text, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, relationship, sessionmaker

# Read database URL from environment; default to local postgres
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://work_user:work_pass@work_db:5432/work_db",
)

# Set up SQLAlchemy
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ORM Models
class Workshop(Base):
    __tablename__ = "workshops"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    modules = relationship(
        "Module", back_populates="workshop", cascade="all, delete-orphan"
    )
    feedback = relationship(
        "Feedback", back_populates="workshop", cascade="all, delete-orphan"
    )


class Module(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True, index=True)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    position = Column(Integer, nullable=False)
    workshop = relationship("Workshop", back_populates="modules")
    substeps = relationship(
        "Substep", back_populates="module", cascade="all, delete-orphan"
    )
    quiz = relationship(
        "Quiz", uselist=False, back_populates="module", cascade="all, delete-orphan"
    )


class Substep(Base):
    __tablename__ = "substeps"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    position = Column(Integer, nullable=False)
    module = relationship("Module", back_populates="substeps")


class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    module = relationship("Module", back_populates="quiz")
    questions = relationship(
        "Question", back_populates="quiz", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    text = Column(Text, nullable=False)
    options = Column(Text, nullable=False)  # JSON encoded list of strings
    correct_answer = Column(String, nullable=False)  # index of correct option as string
    quiz = relationship("Quiz", back_populates="questions")


class StudentProgress(Base):
    __tablename__ = "student_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    highest_substep = Column(Integer, default=-1)
    time_spent = Column(Integer, default=0)  # seconds
    updated_at = Column(DateTime, default=datetime.utcnow)


class StudentQuizScore(Base):
    __tablename__ = "student_quiz_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    stars = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    workshop = relationship("Workshop", back_populates="feedback")


# Create tables on startup
Base.metadata.create_all(bind=engine)


# Pydantic Schemas
class SubstepCreate(BaseModel):
    title: str
    content: str
    position: int


class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position: int
    substeps: Optional[List[SubstepCreate]] = None


class WorkshopCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    modules: Optional[List[ModuleCreate]] = None


class QuestionCreate(BaseModel):
    text: str
    options: List[str]
    correct_answer: int  # index


class QuizCreate(BaseModel):
    title: str
    questions: List[QuestionCreate]


class ProgressUpdate(BaseModel):
    user_id: int
    module_id: int
    substep_position: int
    time_spent: Optional[int] = 0


class QuizSubmission(BaseModel):
    user_id: int
    answers: Dict[int, int]


class FeedbackCreate(BaseModel):
    user_id: int
    workshop_id: int
    stars: Optional[int] = Field(None, ge=1, le=5)
    comments: Optional[str] = None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(
    title="Workshop Service",
    description="Manage workshops, modules, quizzes, student progress and analytics."
)


# Workshop endpoints
@app.post("/workshops", status_code=201)
def create_workshop_endpoint(workshop: WorkshopCreate, db: Session = Depends(get_db)):
    w = Workshop(
        title=workshop.title,
        description=workshop.description,
        start_date=workshop.start_date,
        end_date=workshop.end_date,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    # Add modules and substeps
    if workshop.modules:
        for m in workshop.modules:
            mod = Module(
                workshop_id=w.id,
                title=m.title,
                description=m.description,
                position=m.position,
            )
            db.add(mod)
            db.commit()
            db.refresh(mod)
            if m.substeps:
                for s in m.substeps:
                    ss = Substep(
                        module_id=mod.id,
                        title=s.title,
                        content=s.content,
                        position=s.position,
                    )
                    db.add(ss)
                db.commit()
    return {"id": w.id, "title": w.title}


@app.get("/workshops")
def list_workshops_endpoint(db: Session = Depends(get_db)):
    workshops = db.query(Workshop).all()
    return [
        {
            "id": w.id,
            "title": w.title,
            "description": w.description,
            "start_date": str(w.start_date) if w.start_date else None,
            "end_date": str(w.end_date) if w.end_date else None,
        }
        for w in workshops
    ]


@app.get("/workshops/{workshop_id}")
def get_workshop_endpoint(workshop_id: int, db: Session = Depends(get_db)):
    w = db.query(Workshop).get(workshop_id)
    if not w:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return {
        "id": w.id,
        "title": w.title,
        "description": w.description,
        "start_date": str(w.start_date) if w.start_date else None,
        "end_date": str(w.end_date) if w.end_date else None,
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "position": m.position,
                "substeps": [
                    {
                        "id": s.id,
                        "title": s.title,
                        "content": s.content,
                        "position": s.position,
                    }
                    for s in sorted(m.substeps, key=lambda x: x.position)
                ],
                "quiz": (
                    {
                        "id": m.quiz.id,
                        "title": m.quiz.title,
                        "questions": [
                            {
                                "id": q.id,
                                "text": q.text,
                                "options": json.loads(q.options),
                            }
                            for q in m.quiz.questions
                        ],
                    }
                    if m.quiz
                    else None
                ),
            }
            for m in sorted(w.modules, key=lambda x: x.position)
        ],
    }


# Modules and substeps
@app.post("/workshops/{workshop_id}/modules", status_code=201)
def add_module_endpoint(workshop_id: int, module: ModuleCreate, db: Session = Depends(get_db)):
    if not db.query(Workshop).get(workshop_id):
        raise HTTPException(status_code=404, detail="Workshop not found")
    mod = Module(
        workshop_id=workshop_id,
        title=module.title,
        description=module.description,
        position=module.position,
    )
    db.add(mod)
    db.commit()
    db.refresh(mod)
    if module.substeps:
        for s in module.substeps:
            ss = Substep(
                module_id=mod.id,
                title=s.title,
                content=s.content,
                position=s.position,
            )
            db.add(ss)
        db.commit()
    return {"id": mod.id, "title": mod.title}


@app.post("/modules/{module_id}/substeps", status_code=201)
def add_substep_endpoint(module_id: int, substep: SubstepCreate, db: Session = Depends(get_db)):
    if not db.query(Module).get(module_id):
        raise HTTPException(status_code=404, detail="Module not found")
    ss = Substep(
        module_id=module_id,
        title=substep.title,
        content=substep.content,
        position=substep.position,
    )
    db.add(ss)
    db.commit()
    db.refresh(ss)
    return {"id": ss.id, "title": ss.title}


# Quiz endpoints
@app.post("/modules/{module_id}/quiz", status_code=201)
def create_quiz_endpoint(module_id: int, quiz: QuizCreate, db: Session = Depends(get_db)):
    mod = db.query(Module).get(module_id)
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    if mod.quiz:
        raise HTTPException(status_code=400, detail="Quiz already exists for module")
    qz = Quiz(module_id=module_id, title=quiz.title)
    db.add(qz)
    db.commit()
    db.refresh(qz)
    for qu in quiz.questions:
        question = Question(
            quiz_id=qz.id,
            text=qu.text,
            options=json.dumps(qu.options),
            correct_answer=str(qu.correct_answer),
        )
        db.add(question)
    db.commit()
    return {"id": qz.id, "title": qz.title}


@app.get("/modules/{module_id}/quiz")
def get_quiz_endpoint(module_id: int, db: Session = Depends(get_db)):
    mod = db.query(Module).get(module_id)
    if not mod or not mod.quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    qz = mod.quiz
    return {
        "id": qz.id,
        "title": qz.title,
        "questions": [
            {
                "id": q.id,
                "text": q.text,
                "options": json.loads(q.options),
            }
            for q in qz.questions
        ],
    }


@app.post("/quiz/{quiz_id}/submit")
def submit_quiz_endpoint(quiz_id: int, submission: QuizSubmission, db: Session = Depends(get_db)):
    qz = db.query(Quiz).get(quiz_id)
    if not qz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    correct = 0
    total = len(qz.questions)
    for q in qz.questions:
        selected = submission.answers.get(q.id)
        if selected is not None and str(selected) == q.correct_answer:
            correct += 1
    # Remove previous attempt if exists
    prev = db.query(StudentQuizScore).filter_by(user_id=submission.user_id, quiz_id=quiz_id).first()
    if prev:
        db.delete(prev)
    rec = StudentQuizScore(
        user_id=submission.user_id,
        quiz_id=quiz_id,
        score=correct,
        total_questions=total,
        completed_at=datetime.utcnow(),
    )
    db.add(rec)
    db.commit()
    return {"score": correct, "total": total}


# Progress endpoints
@app.post("/progress", status_code=204)
def update_progress_endpoint(progress: ProgressUpdate, db: Session = Depends(get_db)):
    rec = (
        db.query(StudentProgress)
        .filter_by(user_id=progress.user_id, module_id=progress.module_id)
        .first()
    )
    if rec:
        if progress.substep_position > rec.highest_substep:
            rec.highest_substep = progress.substep_position
        rec.time_spent = (rec.time_spent or 0) + (progress.time_spent or 0)
        rec.updated_at = datetime.utcnow()
    else:
        rec = StudentProgress(
            user_id=progress.user_id,
            module_id=progress.module_id,
            highest_substep=progress.substep_position,
            time_spent=progress.time_spent,
            updated_at=datetime.utcnow(),
        )
        db.add(rec)
    db.commit()
    return


@app.get("/progress/{user_id}")
def get_user_progress_endpoint(user_id: int, db: Session = Depends(get_db)):
    records = db.query(StudentProgress).filter_by(user_id=user_id).all()
    return {
        "user_id": user_id,
        "modules": [
            {
                "module_id": r.module_id,
                "highest_substep": r.highest_substep,
                "time_spent": r.time_spent,
                "updated_at": r.updated_at,
            }
            for r in records
        ],
    }


# Statistics and analytics
@app.get("/workshops/{workshop_id}/stats")
def get_workshop_stats_endpoint(workshop_id: int, db: Session = Depends(get_db)):
    workshop = db.query(Workshop).get(workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    module_stats = []
    for mod in workshop.modules:
        progress_records = db.query(StudentProgress).filter_by(module_id=mod.id).all()
        num_students = len(progress_records)
        if num_students:
            total_ratio = 0.0
            total_substeps = len(mod.substeps) or 1
            for pr in progress_records:
                ratio = (pr.highest_substep + 1) / total_substeps
                total_ratio += ratio
            avg_completion = total_ratio / num_students
        else:
            avg_completion = 0.0
        # Quiz score average
        if mod.quiz:
            quiz_records = db.query(StudentQuizScore).filter_by(quiz_id=mod.quiz.id).all()
            if quiz_records:
                avg_score = sum(r.score / r.total_questions for r in quiz_records) / len(quiz_records)
            else:
                avg_score = 0.0
        else:
            avg_score = None
        module_stats.append({
            "module_id": mod.id,
            "module_title": mod.title,
            "avg_completion_percentage": round(avg_completion * 100, 2),
            "enrolled_students": num_students,
            "avg_quiz_score_percentage": round(avg_score * 100, 2) if avg_score is not None else None,
        })
    # Overall averages
    all_progress = (
        db.query(StudentProgress)
        .join(Module, Module.id == StudentProgress.module_id)
        .filter(Module.workshop_id == workshop_id)
        .all()
    )
    if all_progress:
        total_students = len(set((pr.user_id, pr.module_id) for pr in all_progress))
        total_ratio = 0.0
        total_time = 0
        for pr in all_progress:
            module = db.query(Module).get(pr.module_id)
            total_sub = len(module.substeps) or 1
            total_ratio += (pr.highest_substep + 1) / total_sub
            total_time += pr.time_spent
        avg_completion_all = total_ratio / total_students
        avg_time_per_student = total_time / total_students
    else:
        avg_completion_all = 0.0
        avg_time_per_student = 0.0
    # Feedback
    feedback_records = db.query(Feedback).filter_by(workshop_id=workshop_id).all()
    if feedback_records:
        stars = [f.stars for f in feedback_records if f.stars is not None]
        avg_rating = sum(stars) / len(stars) if stars else None
    else:
        avg_rating = None
    return {
        "workshop_id": workshop_id,
        "average_completion_percentage": round(avg_completion_all * 100, 2),
        "average_time_spent": round(avg_time_per_student, 2),
        "modules": module_stats,
        "average_rating": round(avg_rating, 2) if avg_rating is not None else None,
        "total_feedback": len(feedback_records),
    }


@app.get("/analytics/{workshop_id}")
def analytics_endpoint(workshop_id: int, db: Session = Depends(get_db)):
    workshop = db.query(Workshop).get(workshop_id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    data = {"module_quiz_scores": [], "question_failure_rates": []}
    for mod in workshop.modules:
        if mod.quiz:
            quiz_id = mod.quiz.id
            records = db.query(StudentQuizScore).filter_by(quiz_id=quiz_id).all()
            if records:
                avg_score = (
                    sum(r.score / r.total_questions for r in records) / len(records)
                )
            else:
                avg_score = 0.0
            data["module_quiz_scores"].append({
                "module_id": mod.id,
                "module_title": mod.title,
                "avg_score_percentage": round(avg_score * 100, 2),
            })
            # Without storing per-question answers we cannot compute real failure rates; placeholder
            failures = []
            for q in mod.quiz.questions:
                failures.append({
                    "question_id": q.id,
                    "question_text": q.text,
                    "failure_rate_percentage": None,
                })
            data["question_failure_rates"].append({
                "module_id": mod.id,
                "module_title": mod.title,
                "questions": failures,
            })
    return data


# Feedback
@app.post("/feedback", status_code=201)
def create_feedback_endpoint(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    if not db.query(Workshop).get(feedback.workshop_id):
        raise HTTPException(status_code=404, detail="Workshop not found")
    existing = db.query(Feedback).filter_by(
        user_id=feedback.user_id, workshop_id=feedback.workshop_id
    ).first()
    if existing:
        db.delete(existing)
    fdbk = Feedback(
        user_id=feedback.user_id,
        workshop_id=feedback.workshop_id,
        stars=feedback.stars,
        comments=feedback.comments,
        created_at=datetime.utcnow(),
    )
    db.add(fdbk)
    db.commit()
    return {"detail": "Feedback submitted"}