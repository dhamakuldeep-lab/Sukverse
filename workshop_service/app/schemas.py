"""
Pydantic schemas for request and response models used by the
workshop microservice.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class QuizQuestionBase(BaseModel):
    question: str
    options: Dict[str, str]
    answer: str = Field(..., min_length=1, max_length=2)
    explanation: Optional[str] = None


class QuizQuestionCreate(QuizQuestionBase):
    pass


class QuizQuestionUpdate(BaseModel):
    question: Optional[str] = None
    options: Optional[Dict[str, str]] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None


class QuizQuestionOut(QuizQuestionBase):
    id: int

    class Config:
        orm_mode = True


class SectionBase(BaseModel):
    title: str
    ppt_url: Optional[str] = None
    code: Optional[str] = None


class SectionCreate(SectionBase):
    questions: List[QuizQuestionCreate]


class SectionUpdate(BaseModel):
    title: Optional[str] = None
    ppt_url: Optional[str] = None
    code: Optional[str] = None


class SectionOut(SectionBase):
    id: int
    questions: List[QuizQuestionOut]

    class Config:
        orm_mode = True


class WorkshopBase(BaseModel):
    title: str
    description: Optional[str] = None
    trainer_id: int


class WorkshopCreate(WorkshopBase):
    sections: List[SectionCreate]


class WorkshopUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    trainer_id: Optional[int] = None


class WorkshopOut(WorkshopBase):
    id: int
    sections: List[SectionOut]

    class Config:
        orm_mode = True


class CreateQuestion(BaseModel):
    question: str
    options: Dict[str, str]
    answer: str
    explanation: Optional[str] = None


class ProgressUpdate(BaseModel):
    student_id: int
    section_id: int
    completed: bool