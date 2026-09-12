from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import services.scoring_service as scoring_service
from models import Farmer, Evidence, Attestation

router = APIRouter()

@router.post("/api/v1/farmers/{id}/score")
def trigger_score(id: int, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    evidence_list = db.query(Evidence).filter(Evidence.farmer_id == id).all()
    attestations = db.query(Attestation).filter(Attestation.farmer_id == id).all()
    
    avg_confidence = (sum([e.confidence for e in evidence_list]) / len(evidence_list)) if evidence_list else 0.85
    
    inputs = {
        "crop_diversity": farmer.crop_diversity if farmer.crop_diversity is not None else 0.7,
        "market_price_stability": farmer.market_price_stability if farmer.market_price_stability is not None else 0.75,
        "insurance_claim_ratio": 1.0 - (farmer.insurance_claim_ratio if farmer.insurance_claim_ratio is not None else 0.1),
        "pmkisan_enrollment": 1.0 if farmer.pmkisan_enrollment else 0.0,
        "community_trust_score": farmer.community_trust_score if farmer.community_trust_score is not None else 0.88,
        "evidence_confidence_avg": avg_confidence,
        "seasonal_income": farmer.seasonal_income if farmer.seasonal_income is not None else 280000.0,
        "seasonal_expenses": farmer.seasonal_expenses if farmer.seasonal_expenses is not None else 90000.0,
        "existing_debt_amount": farmer.existing_debt_amount if farmer.existing_debt_amount is not None else 48000.0
    }
    
    score_data = scoring_service.calculate_score(inputs)
    return {"success": True, "data": score_data, "error": None}

@router.get("/api/v1/farmers/{id}/score")
def get_score(id: int, db: Session = Depends(get_db)):
    return trigger_score(id, db)
