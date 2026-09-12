from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer, Consent, Evidence
from routers.score import trigger_score

router = APIRouter()

@router.get("/api/v1/lender/{lenderId}/farmers")
def get_consented_farmers(lenderId: int, db: Session = Depends(get_db)):
    consents = db.query(Consent).filter(Consent.lender_id == lenderId, Consent.granted == True).all()
    farmer_ids = [c.farmer_id for c in consents]
    
    # Real filter based on actual consent
    farmers = db.query(Farmer).filter(Farmer.id.in_(farmer_ids)).all() if farmer_ids else []
    
    result = []
    for f in farmers:
        score_res = trigger_score(f.id, db)
        score_data = score_res["data"]
        evidence_list = db.query(Evidence).filter(Evidence.farmer_id == f.id).all()
        conflicts = [e for e in evidence_list if e.conflict]
        
        avg_conf = round(sum([e.confidence for e in evidence_list]) / len(evidence_list) * 100) if evidence_list else 89
        
        sc = int(score_data["creditworthiness_score"])
        risk = "Strong" if sc >= 85 else ("Good" if sc >= 70 else "Needs Review")
        if conflicts:
            risk = "Needs Review"
            
        result.append({
            "id": f.id,
            "name": f.name,
            "farmer_code": f.farmer_code or f"FP-10{f.id:02d}",
            "location": f.location or "Maharashtra",
            "crop": f.primary_crop,
            "credit_score": sc,
            "repayment_capacity": score_data["repayment_capacity"],
            "recommended_limit": score_data["recommended_limit"],
            "evidence_confidence": avg_conf,
            "risk_status": risk,
            "has_conflicts": len(conflicts) > 0,
            "conflicts_count": len(conflicts)
        })
        
    return {"success": True, "data": result, "error": None}
