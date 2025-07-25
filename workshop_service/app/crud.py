"""
CRUD operations for the workshop microservice.

This module defines helper functions for creating and retrieving
workshops, sections, and quiz questions, as well as updating student
progress.  These functions abstract away direct database access from
the API route handlers.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .db import models
from . import schemas


def create_workshop(db: Session, workshop_data: schemas.WorkshopCreate) -> models.Workshop:
    """Create a new workshop with its sections and questions."""
    workshop = models.Workshop(
        title=workshop_data.title,
        description=workshop_data.description,
        trainer_id=workshop_data.trainer_id,
    )
    # Create nested sections and questions
    for section_data in workshop_data.sections:
        section = models.Section(
            title=section_data.title,
            ppt_url=section_data.ppt_url,
            code=section_data.code,
        )
        for question_data in section_data.questions:
            question = models.QuizQuestion(
                question=question_data.question,
                options=question_data.options,
                answer=question_data.answer,
                explanation=question_data.explanation,
            )
            section.questions.append(question)
        workshop.sections.append(section)
    db.add(workshop)
    db.commit()
    db.refresh(workshop)
    return workshop


def get_workshops(db: Session) -> List[models.Workshop]:
    return db.query(models.Workshop).all()


def get_workshop(db: Session, workshop_id: int) -> Optional[models.Workshop]:
    return db.query(models.Workshop).filter(models.Workshop.id == workshop_id).first()


def record_progress(db: Session, progress: schemas.ProgressUpdate) -> models.StudentProgress:
    # Find existing progress record or create a new one
    existing = (
        db.query(models.StudentProgress)
        .filter(
            models.StudentProgress.student_id == progress.student_id,
            models.StudentProgress.section_id == progress.section_id,
        )
        .first()
    )
    if existing:
        existing.completed = progress.completed
        existing.completed_at = datetime.utcnow() if progress.completed else None
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_progress = models.StudentProgress(
            student_id=progress.student_id,
            section_id=progress.section_id,
            completed=progress.completed,
            completed_at=datetime.utcnow() if progress.completed else None,
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        return new_progress


def update_workshop(db: Session, workshop_id: int, update_data: schemas.WorkshopUpdate):
    """
    Partially update a workshop's basic fields (title, description, trainer_id).
    Sections and questions should be modified via their own endpoints.
    """
    workshop = db.query(models.Workshop).filter(models.Workshop.id == workshop_id).first()
    if not workshop:
        return None
    if update_data.title is not None:
        workshop.title = update_data.title
    if update_data.description is not None:
        workshop.description = update_data.description
    if update_data.trainer_id is not None:
        workshop.trainer_id = update_data.trainer_id
    db.commit()
    db.refresh(workshop)
    return workshop


def delete_workshop(db: Session, workshop_id: int) -> bool:
    workshop = db.query(models.Workshop).filter(models.Workshop.id == workshop_id).first()
    if not workshop:
        return False
    db.delete(workshop)
    db.commit()
    return True


def create_section(db: Session, workshop_id: int, section_data: schemas.SectionCreate) -> Optional[models.Section]:
    workshop = db.query(models.Workshop).filter(models.Workshop.id == workshop_id).first()
    if not workshop:
        return None
    section = models.Section(
        workshop_id=workshop_id,
        title=section_data.title,
        ppt_url=section_data.ppt_url,
        code=section_data.code,
    )
    for question_data in section_data.questions:
        question = models.QuizQuestion(
            question=question_data.question,
            options=question_data.options,
            answer=question_data.answer,
            explanation=question_data.explanation,
        )
        section.questions.append(question)
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


def update_section(db: Session, section_id: int, update_data: schemas.SectionUpdate):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        return None
    if update_data.title is not None:
        section.title = update_data.title
    if update_data.ppt_url is not None:
        section.ppt_url = update_data.ppt_url
    if update_data.code is not None:
        section.code = update_data.code
    db.commit()
    db.refresh(section)
    return section


def delete_section(db: Session, section_id: int) -> bool:
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        return False
    db.delete(section)
    db.commit()
    return True


def create_question(db: Session, section_id: int, question_data: schemas.CreateQuestion):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        return None
    question = models.QuizQuestion(
        section_id=section_id,
        question=question_data.question,
        options=question_data.options,
        answer=question_data.answer,
        explanation=question_data.explanation,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def update_question(db: Session, question_id: int, update_data: schemas.QuizQuestionUpdate):
    question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()
    if not question:
        return None
    if update_data.question is not None:
        question.question = update_data.question
    if update_data.options is not None:
        question.options = update_data.options
    if update_data.answer is not None:
        question.answer = update_data.answer
    if update_data.explanation is not None:
        question.explanation = update_data.explanation
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: int) -> bool:
    question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()
    if not question:
        return False
    db.delete(question)
    db.commit()
    return True