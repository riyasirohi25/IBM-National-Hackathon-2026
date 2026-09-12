from sqlalchemy.orm import Session
import models
import schemas

CONFIDENCE_BY_SOURCE = {
    "government_record": 0.98,
    "market_transaction": 0.95,
    "fpo_verification":   0.92,
    "self_declared":      0.55,
}

def create_farmer_evidence(db: Session, evidence: schemas.EvidenceCreate, farmer_id: int):
    confidence = CONFIDENCE_BY_SOURCE.get(evidence.source, 0.0)
    db_evidence = models.Evidence(
        farmer_id=farmer_id,
        claim=evidence.claim,
        value=evidence.value,
        unit=evidence.unit,
        source=evidence.source,
        confidence=confidence,
        conflict=False
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence

def get_farmer_evidence(db: Session, farmer_id: int):
    return db.query(models.Evidence).filter(models.Evidence.farmer_id == farmer_id).all()
