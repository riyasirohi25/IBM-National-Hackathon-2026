from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer, Evidence
import schemas

router = APIRouter()

@router.get("/api/v1/farmers")
def list_farmers(db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return {"success": True, "data": farmers, "error": None}

@router.post("/api/v1/farmers")
def create_farmer(farmer: schemas.FarmerCreate, db: Session = Depends(get_db)):
    db_farmer = Farmer(**farmer.model_dump())
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return {"success": True, "data": db_farmer, "error": None}

@router.get("/api/v1/farmers/{id}")
def get_farmer(id: int, db: Session = Depends(get_db)):
    db_farmer = db.query(Farmer).filter(Farmer.id == id).first()
    if not db_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    evidences = db.query(Evidence).filter(Evidence.farmer_id == id).all()
    return {"success": True, "data": {"profile": db_farmer, "evidence_vault": evidences}, "error": None}
