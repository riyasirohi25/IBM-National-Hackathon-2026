from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Consent
from auth_model import User
import schemas
import services.audit_log_service as audit_log_service
from pydantic import BaseModel

router = APIRouter()

@router.post("/api/v1/farmers/{id}/consent")
def set_consent(id: int, consent: schemas.ConsentCreate, db: Session = Depends(get_db)):
    db_consent = db.query(Consent).filter(Consent.farmer_id == id, Consent.lender_id == consent.lender_id).first()
    if db_consent:
        db_consent.granted = consent.granted
    else:
        db_consent = Consent(farmer_id=id, lender_id=consent.lender_id, granted=consent.granted)
        db.add(db_consent)
        
    db.commit()
    db.refresh(db_consent)
    
    # Get lender name for log
    lender = db.query(User).filter(User.role == "lender", User.linked_id == consent.lender_id).first()
    lname = lender.name if lender else f"Lender #{consent.lender_id}"
    action = "granted" if consent.granted else "revoked"
    audit_log_service.append_audit_log(db, id, f"Consent {action} for {lname}")
    
    return {"success": True, "data": db_consent, "error": None}

@router.get("/api/v1/farmers/{id}/consents")
def get_farmer_consents(id: int, db: Session = Depends(get_db)):
    consents = db.query(Consent).filter(Consent.farmer_id == id).all()
    # Let's get lender info
    lenders = db.query(User).filter(User.role == "lender").all()
    lmap = {l.linked_id: l.name for l in lenders}
    
    result = []
    # Mix existing consents
    c_map = {c.lender_id: c.granted for c in consents}
    for lid, lname in lmap.items():
        result.append({
            "lender_id": lid,
            "lender_name": lname,
            "is_active": c_map.get(lid, False),
            "granted_at": "N/A"
        })
    return {"success": True, "data": result, "error": None}

class AuditLogRequest(BaseModel):
    event_str: str

@router.post("/api/v1/farmers/{id}/audit-log")
def create_audit_log(id: int, body: AuditLogRequest, db: Session = Depends(get_db)):
    log = audit_log_service.append_audit_log(db, id, body.event_str)
    return {"success": True, "data": log, "error": None}

@router.get("/api/v1/farmers/{id}/audit-log")
def get_audit_log(id: int, db: Session = Depends(get_db)):
    logs = audit_log_service.get_audit_logs(db, id)
    return {"success": True, "data": logs, "error": None}
