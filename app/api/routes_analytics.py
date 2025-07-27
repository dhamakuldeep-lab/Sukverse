"""
API routes for the analytics service.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(workshop_id: int, db: Session = Depends(get_db)):
    data = analytics_service.get_dashboard(db, workshop_id)
    return data


@router.get("/at-risk")
def at_risk(db: Session = Depends(get_db)):
    data = analytics_service.get_at_risk_students(db)
    return data