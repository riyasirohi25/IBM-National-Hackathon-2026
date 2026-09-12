from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Evidence

router = APIRouter()

@router.get("/api/v1/farmers/{id}/conflicts")
def get_conflicts(id: int, db: Session = Depends(get_db)):
    conflicts = db.query(Evidence).filter(Evidence.farmer_id == id, Evidence.conflict == True).all()
    return {"success": True, "data": conflicts, "error": None}
