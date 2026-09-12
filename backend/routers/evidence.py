from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
import services.evidence_service as evidence_service

router = APIRouter()

@router.post("/api/v1/farmers/{id}/evidence")
def create_evidence(id: int, evidence: schemas.EvidenceCreate, db: Session = Depends(get_db)):
    db_evidence = evidence_service.create_farmer_evidence(db=db, evidence=evidence, farmer_id=id)
    return {"success": True, "data": db_evidence, "error": None}

@router.get("/api/v1/farmers/{id}/evidence")
def get_evidence(id: int, db: Session = Depends(get_db)):
    evidence_list = evidence_service.get_farmer_evidence(db=db, farmer_id=id)
    return {"success": True, "data": evidence_list, "error": None}
