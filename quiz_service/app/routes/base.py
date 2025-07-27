from fastapi import APIRouter

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

@router.get("/ping")
def ping():
    return {"status": "quiz service up"}
