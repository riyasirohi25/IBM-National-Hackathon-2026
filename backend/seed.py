import os
import pandas as pd
from database import engine, Base, SessionLocal
import models

def seed_database():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    dataset_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "krishi_pramaan_dataset"))
    
    # 1. Load Farmers
    farmers_csv = os.path.join(dataset_dir, "farmers.csv")
    farmer_id_map = {} # Maps "F001" -> integer id
    
    if os.path.exists(farmers_csv):
        df_farmers = pd.read_csv(farmers_csv)
        print(f"Reading {len(df_farmers)} farmers from CSV...")
        
        # Ensure our primary demo farmer Rajesh Kumar is farmer #1
        for idx, row in df_farmers.iterrows():
            code = str(row['farmer_id'])
            name = str(row['farmer_name'])
            
            farmer = models.Farmer(
                farmer_code=code,
                name=name,
                age=int(row['age']) if pd.notnull(row.get('age')) else 45,
                gender=str(row['gender']) if pd.notnull(row.get('gender')) else "Male",
                state=str(row['state']) if pd.notnull(row.get('state')) else "Maharashtra",
                district=str(row['district']) if pd.notnull(row.get('district')) else "Nashik",
                fpo_name=str(row['fpo_name']) if pd.notnull(row.get('fpo_name')) else "Sahyadri Farmer Producer Co.",
                fpo_id=1,
                location=f"{row.get('district', 'Nashik')}, {row.get('state', 'Maharashtra')}",
                land_area_acres=float(row['land_area_acres']) if pd.notnull(row.get('land_area_acres')) else 3.5,
                primary_crop=str(row['primary_crop']) if pd.notnull(row.get('primary_crop')) else "Wheat",
                season=str(row['season']) if pd.notnull(row.get('season')) else "Kharif",
                seasonal_income=float(row['seasonal_income']) if pd.notnull(row.get('seasonal_income')) else 280000.0,
                seasonal_expenses=float(row['seasonal_expenses']) if pd.notnull(row.get('seasonal_expenses')) else 90000.0,
                existing_debt_amount=float(row['existing_debt_amount']) if pd.notnull(row.get('existing_debt_amount')) else 48000.0,
                crop_diversity=float(row['crop_diversity']) if pd.notnull(row.get('crop_diversity')) else 0.7,
                market_price_stability=float(row['market_price_stability']) if pd.notnull(row.get('market_price_stability')) else 0.75,
                insurance_claim_ratio=float(row['insurance_claim_ratio']) if pd.notnull(row.get('insurance_claim_ratio')) else 0.1,
                pmkisan_enrollment=int(row['pmkisan_enrollment']) if pd.notnull(row.get('pmkisan_enrollment')) else 1,
                community_trust_score=float(row['community_trust_score']) if pd.notnull(row.get('community_trust_score')) else 0.88,
                irrigation_available=int(row['irrigation_available']) if pd.notnull(row.get('irrigation_available')) else 1
            )
            db.add(farmer)
            db.flush()
            farmer_id_map[code] = farmer.id
            
        print(f"Loaded {len(farmer_id_map)} farmers successfully.")
    
    # 2. Load Evidence
    evidence_csv = os.path.join(dataset_dir, "evidence.csv")
    if os.path.exists(evidence_csv):
        df_ev = pd.read_csv(evidence_csv)
        print(f"Reading {len(df_ev)} evidence entries from CSV...")
        for _, row in df_ev.iterrows():
            f_code = str(row['farmer_id'])
            if f_code in farmer_id_map:
                f_id = farmer_id_map[f_code]
                val_float = None
                val_text = None
                try:
                    val_float = float(row['value'])
                except (ValueError, TypeError):
                    val_text = str(row['value'])
                    
                ev = models.Evidence(
                    evidence_code=str(row['evidence_id']),
                    farmer_id=f_id,
                    claim=str(row['claim']),
                    value=val_float,
                    value_text=val_text,
                    unit=str(row['unit']),
                    source=str(row['source']),
                    confidence=float(row['confidence']) if pd.notnull(row.get('confidence')) else 0.85,
                    conflict=bool(row['conflict']) if pd.notnull(row.get('conflict')) else False
                )
                db.add(ev)
                
    # 3. Load Attestations
    attest_csv = os.path.join(dataset_dir, "fpo_attestations.csv")
    if os.path.exists(attest_csv):
        df_att = pd.read_csv(attest_csv)
        for _, row in df_att.iterrows():
            f_code = str(row['farmer_id'])
            if f_code in farmer_id_map:
                f_id = farmer_id_map[f_code]
                val_float = None
                try:
                    val_float = float(row['value'])
                except (ValueError, TypeError):
                    pass
                att = models.Attestation(
                    farmer_id=f_id,
                    fpo_name=str(row.get('fpo_name', 'Sahyadri FPO')),
                    claim=str(row.get('claim', 'Production Quantity')),
                    value=val_float,
                    unit=str(row.get('unit', 'tonnes')),
                    status=str(row.get('status', 'verified')),
                    attested_by=str(row.get('attested_by', 'FPO Representative'))
                )
                db.add(att)
                
    # 4. Default Consents for Lender 1
    for f_code, f_id in farmer_id_map.items():
        consent = models.Consent(
            farmer_id=f_id,
            lender_id=1,
            granted=True
        )
        db.add(consent)
        
        # Add sample audit logs
        log1 = models.AuditLog(
            farmer_id=f_id,
            event="Profile created with initial evidence vault",
            hash_value="a3f76c90b2e841f"
        )
        log2 = models.AuditLog(
            farmer_id=f_id,
            event="Access granted to AgriGrowth Finance",
            hash_value="8e9b14c33f20da1"
        )
        db.add(log1)
        db.add(log2)

    db.commit()
    db.close()
    print("Database seeding completed cleanly!")

if __name__ == "__main__":
    seed_database()
