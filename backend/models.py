from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Farmer(Base):
    """Farmer entity representing smallholder farmers"""
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    phone_number = Column(String(20), unique=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    location = Column(String(200))
    fpo_id = Column(String(50), index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    credit_profile = relationship("CreditProfile", back_populates="farmer", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="farmer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Farmer(id={self.id}, name={self.name}, farmer_id={self.farmer_id})>"


class CreditProfile(Base):
    """Credit profile for farmers with verifiable credit history"""
    __tablename__ = "credit_profiles"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), unique=True, nullable=False)
    credit_score = Column(Float, default=0.0)
    total_loans = Column(Integer, default=0)
    active_loans = Column(Integer, default=0)
    repayment_rate = Column(Float, default=0.0)
    total_borrowed = Column(Float, default=0.0)
    total_repaid = Column(Float, default=0.0)
    default_count = Column(Integer, default=0)
    verification_status = Column(String(20), default="pending")  # pending, verified, rejected
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="credit_profile")

    def __repr__(self):
        return f"<CreditProfile(id={self.id}, farmer_id={self.farmer_id}, credit_score={self.credit_score})>"


class Transaction(Base):
    """Transaction history for farmers"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # loan, repayment, default
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    lender_name = Column(String(200), nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, farmer_id={self.farmer_id}, type={self.transaction_type}, amount={self.amount})>"
