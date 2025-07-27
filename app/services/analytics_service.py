"""
Business logic for analytics.  In a production system this service would
subscribe to Kafka topics and update the analytics tables accordingly.
Here we provide simple functions to query aggregated data.
"""

from sqlalchemy.orm import Session
from ..models.analytics import StudentModuleProgress, QuizScoresSummary, LoginActivity, AtRiskStudent


def get_dashboard(db: Session, workshop_id: int):
    """Return high‑level metrics for a workshop."""
    module_stats = db.query(StudentModuleProgress).filter(StudentModuleProgress.workshop_id == workshop_id).all()
    quiz_stats = db.query(QuizScoresSummary).filter(QuizScoresSummary.quiz_id == workshop_id).all()
    return {
        "completion": [
            {"user_id": m.user_id, "percent_complete": m.percent_complete} for m in module_stats
        ],
        "quiz_scores": [
            {"user_id": q.user_id, "average_score": q.average_score, "pass_fail": q.pass_fail} for q in quiz_stats
        ],
    }


def get_at_risk_students(db: Session):
    """List students flagged as at risk."""
    risks = db.query(AtRiskStudent).order_by(AtRiskStudent.risk_score.desc()).all()
    return [
        {"user_id": r.user_id, "risk_score": r.risk_score, "reason": r.flagged_reason} for r in risks
    ]