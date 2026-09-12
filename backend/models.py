from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(Integer, primary_key=True, index=True)
    farmer_code = Column(String, index=True, nullable=True) # e.g. "F001" or "FP-1024"
    name = Column(String, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    fpo_id = Column(Integer, index=True, default=1)
    fpo_name = Column(String, nullable=True)
    location = Column(String, nullable=True)
    land_area_acres = Column(Float, default=3.5)
    primary_crop = Column(String, default="Wheat")
    season = Column(String, default="Kharif")
    seasonal_income = Column(Float, default=280000.0)
    seasonal_expenses = Column(Float, default=90000.0)
    existing_debt_amount = Column(Float, default=48000.0)
    crop_diversity = Column(Float, default=0.7)
    market_price_stability = Column(Float, default=0.75)
    insurance_claim_ratio = Column(Float, default=0.1)
    pmkisan_enrollment = Column(Integer, default=1)
    community_trust_score = Column(Float, default=0.88)
    irrigation_available = Column(Integer, default=1)
    
    credit_profile = relationship("CreditProfile", back_populates="farmer", uselist=False)
    evidence = relationship("Evidence", back_populates="farmer")
    attestations = relationship("Attestation", back_populates="farmer")
    consents = relationship("Consent", back_populates="farmer")
    audit_logs = relationship("AuditLog", back_populates="farmer")

class CreditProfile(Base):
    __tablename__ = "credit_profiles"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    credit_score = Column(Float)
    repayment_capacity = Column(Float, nullable=True)
    recommended_limit = Column(Float, nullable=True)
    
    farmer = relationship("Farmer", back_populates="credit_profile")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    amount = Column(Float)
    type = Column(String)

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True, index=True)
    evidence_code = Column(String, nullable=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    claim = Column(String)
    value = Column(Float, nullable=True)
    value_text = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    source = Column(String, nullable=True)
    confidence = Column(Float, default=0.85)
    conflict = Column(Boolean, default=False)
    
    farmer = relationship("Farmer", back_populates="evidence")

class Attestation(Base):
    __tablename__ = "attestations"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    fpo_name = Column(String, nullable=True)
    claim = Column(String, nullable=True)
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    status = Column(String, default="verified")
    attested_by = Column(String, nullable=True)
    
    farmer = relationship("Farmer", back_populates="attestations")

class Consent(Base):
    __tablename__ = "consents"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    lender_id = Column(Integer, default=1)
    granted = Column(Boolean, default=True)
    
    farmer = relationship("Farmer", back_populates="consents")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    event = Column(String)
    hash_value = Column(String, nullable=True)
    
    farmer = relationship("Farmer", back_populates="audit_logs")
