from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer, Evidence, Attestation
from auth_model import User

router = APIRouter()

@router.get("/api/v1/fpo/{fpoId}/aggregate-risk")
def get_fpo_risk(fpoId: int, db: Session = Depends(get_db)):
    fpo_user = db.query(User).filter(User.role == "fpo", User.linked_id == fpoId).first()
    fpo_name = fpo_user.name if fpo_user else "Sahyadri FPO"
    
    # Actually filter by fpoId
    farmers = db.query(Farmer).filter(Farmer.fpo_id == fpoId).all()
    total_farmers = len(farmers)
    
    farmer_list = []
    conflict_count = 0
    verified_count = 0
    needs_verification_count = 0
    
    for f in farmers:
        evidences = db.query(Evidence).filter(Evidence.farmer_id == f.id).all()
        attestations = db.query(Attestation).filter(Attestation.farmer_id == f.id).all()
        has_conflict = any(e.conflict for e in evidences)
        
        avg_conf = round(sum([e.confidence for e in evidences]) / len(evidences) * 100) if evidences else 85
        
        status = "Verified"
        if has_conflict:
            status = "Conflict"
            conflict_count += 1
        elif len(attestations) == 0:
            status = "Needs Verification"
            needs_verification_count += 1
        else:
            verified_count += 1
            
        farmer_list.append({
            "id": f.id,
            "name": f.name,
            "farmer_code": f.farmer_code or f"FP-10{f.id:02d}",
            "location": f.location or "Nashik",
            "crop": f.primary_crop,
            "land_area": f"{f.land_area_acres} acres",
            "original_claim": f"{round(f.land_area_acres * 3.5, 1)} tonnes",
            "status": status,
            "confidence": avg_conf,
            "has_conflict": has_conflict
        })
        
    return {
        "success": True,
        "data": {
            "fpo_name": fpo_name,
            "location": "Nashik, Maharashtra",
            "trust_score": 87 if total_farmers > 0 else 0,
            "evidence_verification": 92 if total_farmers > 0 else 0,
            "attestation_coverage": round((len(farmers)-needs_verification_count)/len(farmers)*100) if total_farmers > 0 else 0,
            "claim_consistency": 86 if total_farmers > 0 else 0,
            "total_farmers": total_farmers,
            "verified": verified_count,
            "conflict_flags": conflict_count,
            "awaiting_verification": needs_verification_count,
            "farmers": farmer_list
        },
        "error": None
    }
