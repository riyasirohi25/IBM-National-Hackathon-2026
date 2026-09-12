from database import SessionLocal
from models import Farmer, Consent, Evidence

def fix_db():
    db = SessionLocal()
    farmers = db.query(Farmer).all()
    for farmer in farmers:
        # Check Consent
        consent = db.query(Consent).filter(Consent.farmer_id == farmer.id, Consent.lender_id == 1).first()
        if not consent:
            db.add(Consent(farmer_id=farmer.id, lender_id=1, granted=True))
        
        # Check Evidence
        evidence = db.query(Evidence).filter(Evidence.farmer_id == farmer.id, Evidence.claim == 'production_quantity').first()
        if not evidence:
            evidences = [
                Evidence(farmer_id=farmer.id, claim="production_quantity", value=round(farmer.land_area_acres * 3.5, 1) if farmer.land_area_acres else 0, unit="tonnes", source="self_declared", confidence=0.85, conflict=False),
                Evidence(farmer_id=farmer.id, claim="land_area", value=farmer.land_area_acres, unit="acres", source="self_declared", confidence=0.85, conflict=False),
                Evidence(farmer_id=farmer.id, claim="seasonal_income", value=farmer.seasonal_income, unit="INR", source="self_declared", confidence=0.85, conflict=False)
            ]
            db.add_all(evidences)
    db.commit()
    db.close()
    print("Database fixed!")

if __name__ == "__main__":
    fix_db()
