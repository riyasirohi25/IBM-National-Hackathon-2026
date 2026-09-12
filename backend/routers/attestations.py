from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Attestation, Evidence
import schemas
import services.conflict_service as conflict_service
import services.audit_log_service as audit_log_service
from auth_model import User

router = APIRouter()

@router.post("/api/v1/farmers/{id}/attestations")
def create_attestation(id: int, att: schemas.AttestationCreate, db: Session = Depends(get_db)):
    fpo = db.query(User).filter(User.role == "fpo", User.linked_id == att.fpo_member_id).first()
    fpo_name = fpo.name if fpo else f"FPO #{att.fpo_member_id}"

    db_att = Attestation(farmer_id=id, fpo_name=fpo_name, claim=att.claim, value=att.value)
    db.add(db_att)
    
    if att.value is not None:
        db_evidences = db.query(Evidence).filter(
            Evidence.farmer_id == id,
            Evidence.claim.in_([att.claim, "Production Quantity" if att.claim == "production_quantity" else att.claim])
        ).all()
        for ev in db_evidences:
            conflict_service.process_evidence_conflict(db, ev, att.value)
            
    db.commit()
    db.refresh(db_att)
    
    audit_log_service.append_audit_log(db, id, f"FPO member {fpo_name} attested {att.claim}")
    
    return {"success": True, "data": db_att, "error": None}
