"""
FastAPI router for workshop operations.

This module defines REST endpoints for managing workshops, including
listing existing workshops, creating new workshops (trainers only),
retrieving details of a specific workshop with sections and quiz
questions, and recording student progress through sections.  It also
provides endpoints for adding, updating and removing sections and
quiz questions within a workshop.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import crud, schemas


router = APIRouter(prefix="/workshops", tags=["Workshops"])


@router.get("/", response_model=list[schemas.WorkshopOut])
def list_workshops(db: Session = Depends(get_db)):
    return crud.get_workshops(db)


@router.get("/{workshop_id}", response_model=schemas.WorkshopOut)
def get_workshop(workshop_id: int, db: Session = Depends(get_db)):
    workshop = crud.get_workshop(db, workshop_id)
    if not workshop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workshop not found")
    return workshop


@router.post("/", response_model=schemas.WorkshopOut, status_code=status.HTTP_201_CREATED)
def create_new_workshop(workshop: schemas.WorkshopCreate, db: Session = Depends(get_db)):
    return crud.create_workshop(db, workshop)


@router.put("/{workshop_id}", response_model=schemas.WorkshopOut)
def update_existing_workshop(workshop_id: int, workshop: schemas.WorkshopUpdate, db: Session = Depends(get_db)):
    updated = crud.update_workshop(db, workshop_id, workshop)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workshop not found")
    return updated


@router.delete("/{workshop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workshop(workshop_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_workshop(db, workshop_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workshop not found")
    return None


@router.post("/progress", status_code=status.HTTP_200_OK)
def update_progress(progress: schemas.ProgressUpdate, db: Session = Depends(get_db)):
    return crud.record_progress(db, progress)


# Section management endpoints
@router.post("/{workshop_id}/sections", response_model=schemas.SectionOut, status_code=status.HTTP_201_CREATED)
def create_section(workshop_id: int, section: schemas.SectionCreate, db: Session = Depends(get_db)):
    new_section = crud.create_section(db, workshop_id, section)
    if not new_section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workshop not found")
    return new_section


@router.put("/sections/{section_id}", response_model=schemas.SectionOut)
def update_section(section_id: int, section: schemas.SectionUpdate, db: Session = Depends(get_db)):
    updated = crud.update_section(db, section_id, section)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return updated


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_section(db, section_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return None


# Quiz question management endpoints
@router.post("/sections/{section_id}/questions", response_model=schemas.QuizQuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(section_id: int, question: schemas.CreateQuestion, db: Session = Depends(get_db)):
    new_question = crud.create_question(db, section_id, question)
    if not new_question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return new_question


@router.put("/questions/{question_id}", response_model=schemas.QuizQuestionOut)
def update_question(question_id: int, question: schemas.QuizQuestionUpdate, db: Session = Depends(get_db)):
    updated = crud.update_question(db, question_id, question)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return updated


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_question(db, question_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return None