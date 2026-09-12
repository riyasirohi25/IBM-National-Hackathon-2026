import math
from models import Evidence
from sqlalchemy.orm import Session

def check_conflict(farmer_value: float, other_value: float):
    # As per TECH.md §5: flag if abs(farmer_value - other_value) / other_value > 0.20
    if other_value == 0:
        return False, "Cannot compute conflict with 0 other value."
    
    conflict = abs(farmer_value - other_value) / other_value > 0.20
    flag = None
    if conflict:
        flag = f"Evidence conflict: farmer claimed {farmer_value}, sources suggest {other_value}"
    return conflict, flag

def process_evidence_conflict(db: Session, db_evidence: Evidence, new_value: float):
    conflict, flag = check_conflict(db_evidence.value, new_value)
    if conflict:
        # multiply that claim's confidence by 0.6
        db_evidence.confidence *= 0.6
        db_evidence.conflict = True
        db.commit()
    return conflict, flag
