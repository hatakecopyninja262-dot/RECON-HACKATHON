from fastapi import APIRouter
from app.database import db

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "database_mode": "supabase" if not db.use_mock else "mock_in_memory"
    }
