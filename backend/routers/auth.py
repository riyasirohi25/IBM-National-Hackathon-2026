from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth_model import User
from models import Farmer
import datetime, hashlib, uuid

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# ─── Pydantic schemas ──────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class FarmerRegRequest(BaseModel):
    email: str
    password: str
    name: str
    age: int
    gender: str
    state: str
    district: str
    fpo_name: Optional[str] = "Independent"
    land_area_acres: float
    primary_crop: str
    season: str
    seasonal_income: float
    seasonal_expenses: float
    existing_debt_amount: float = 0
    irrigation_available: bool = True
    pmkisan_enrollment: bool = False

class FPORegRequest(BaseModel):
    email: str
    password: str
    name: str          # contact person name
    fpo_name: str
    state: str
    district: str

class LenderRegRequest(BaseModel):
    email: str
    password: str
    name: str          # contact person name
    institution_name: str
    institution_type: str   # Bank | NBFC | MFI | Co-operative
    license_number: Optional[str] = None

# ─── Helper ───────────────────────────────────────────────────────────────────

def _user_exists(email: str, db: Session):
    return db.query(User).filter(User.email == email.lower()).first()

# ─── LOGIN ────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not user.check_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    tok = user.new_token()
    db.commit()
    return {"success": True, "data": {
        "token": tok,
        "role": user.role,
        "linked_id": user.linked_id,
        "name": user.name,
        "email": user.email
    }, "error": None}

# ─── REGISTER FARMER ──────────────────────────────────────────────────────────

@router.post("/register/farmer")
def register_farmer(body: FarmerRegRequest, db: Session = Depends(get_db)):
    if _user_exists(body.email, db):
        raise HTTPException(status_code=409, detail="Email already registered")

    # Determine next farmer code
    count = db.query(Farmer).count()
    code = f"F{count+1:03d}"

    farmer = Farmer(
        farmer_code=code,
        name=body.name,
        age=body.age,
        gender=body.gender,
        state=body.state,
        district=body.district,
        fpo_name=body.fpo_name,
        location=f"{body.district}, {body.state}",
        land_area_acres=body.land_area_acres,
        primary_crop=body.primary_crop,
        season=body.season,
        seasonal_income=body.seasonal_income,
        seasonal_expenses=body.seasonal_expenses,
        existing_debt_amount=body.existing_debt_amount,
        irrigation_available=1 if body.irrigation_available else 0,
        pmkisan_enrollment=1 if body.pmkisan_enrollment else 0,
        crop_diversity=0.5,
        market_price_stability=0.7,
        insurance_claim_ratio=0.1,
        community_trust_score=0.75,
        fpo_id=1,
    )
    db.add(farmer)
    db.flush()  # get farmer.id

    user = User(
        email=body.email.lower(),
        password_hash=User.hash_password(body.password),
        role="farmer",
        name=body.name,
        linked_id=farmer.id,
    )
    tok = user.new_token()
    db.add(user)
    
    from models import Consent, Evidence
    consent = Consent(farmer_id=farmer.id, lender_id=1, granted=True)
    db.add(consent)
    
    evidences = [
        Evidence(farmer_id=farmer.id, claim="production_quantity", value=round(body.land_area_acres * 3.5, 1), unit="tonnes", source="self_declared", confidence=0.85, conflict=False),
        Evidence(farmer_id=farmer.id, claim="land_area", value=body.land_area_acres, unit="acres", source="self_declared", confidence=0.85, conflict=False),
        Evidence(farmer_id=farmer.id, claim="seasonal_income", value=body.seasonal_income, unit="INR", source="self_declared", confidence=0.85, conflict=False)
    ]
    db.add_all(evidences)
    
    db.commit()

    return {"success": True, "data": {
        "token": tok, "role": "farmer",
        "linked_id": farmer.id, "name": body.name,
        "farmer_code": code
    }, "error": None}

# ─── REGISTER FPO ─────────────────────────────────────────────────────────────

@router.post("/register/fpo")
def register_fpo(body: FPORegRequest, db: Session = Depends(get_db)):
    if _user_exists(body.email, db):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email=body.email.lower(),
        password_hash=User.hash_password(body.password),
        role="fpo",
        name=f"{body.name} ({body.fpo_name})",
        linked_id=1,   # all FPO users link to FPO 1 for this demo
    )
    tok = user.new_token()
    db.add(user)
    db.commit()
    return {"success": True, "data": {
        "token": tok, "role": "fpo",
        "linked_id": 1, "name": body.name
    }, "error": None}

# ─── REGISTER LENDER ──────────────────────────────────────────────────────────

@router.post("/register/lender")
def register_lender(body: LenderRegRequest, db: Session = Depends(get_db)):
    if _user_exists(body.email, db):
        raise HTTPException(status_code=409, detail="Email already registered")
    # Determine lender_id (simple: count existing lender users + 1)
    lender_count = db.query(User).filter(User.role == "lender").count()
    lender_id = lender_count + 1
    user = User(
        email=body.email.lower(),
        password_hash=User.hash_password(body.password),
        role="lender",
        name=f"{body.name} — {body.institution_name}",
        linked_id=1,   # lender_id 1 for demo
    )
    tok = user.new_token()
    db.add(user)
    db.commit()
    return {"success": True, "data": {
        "token": tok, "role": "lender",
        "linked_id": 1, "name": body.name,
        "institution": body.institution_name
    }, "error": None}

# ─── VERIFY TOKEN (frontend uses this on refresh) ─────────────────────────────

@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"success": True, "data": {
        "token": token, "role": user.role,
        "linked_id": user.linked_id, "name": user.name,
        "email": user.email
    }, "error": None}

@router.post("/logout")
def logout(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if user:
        user.token = None
        db.commit()
    return {"success": True, "data": None, "error": None}
