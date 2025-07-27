from fastapi import APIRouter

router = APIRouter(prefix="/certificates", tags=["certificates"])

@router.get("/ping")
def ping():
    return {"status": "certificate service up"}
