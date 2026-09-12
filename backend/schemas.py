from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Farmer Schemas
class FarmerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone_number: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    location: Optional[str] = Field(None, max_length=200)
    fpo_id: Optional[str] = Field(None, max_length=50)


class FarmerCreate(FarmerBase):
    farmer_id: str = Field(..., min_length=1, max_length=50)


class FarmerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    location: Optional[str] = Field(None, max_length=200)
    fpo_id: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class FarmerResponse(FarmerBase):
    id: int
    farmer_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Credit Profile Schemas
class CreditProfileBase(BaseModel):
    credit_score: float = Field(default=0.0, ge=0, le=1000)
    total_loans: int = Field(default=0, ge=0)
    active_loans: int = Field(default=0, ge=0)
    repayment_rate: float = Field(default=0.0, ge=0, le=100)
    total_borrowed: float = Field(default=0.0, ge=0)
    total_repaid: float = Field(default=0.0, ge=0)
    default_count: int = Field(default=0, ge=0)


class CreditProfileCreate(CreditProfileBase):
    farmer_id: int


class CreditProfileUpdate(BaseModel):
    credit_score: Optional[float] = Field(None, ge=0, le=1000)
    total_loans: Optional[int] = Field(None, ge=0)
    active_loans: Optional[int] = Field(None, ge=0)
    repayment_rate: Optional[float] = Field(None, ge=0, le=100)
    total_borrowed: Optional[float] = Field(None, ge=0)
    total_repaid: Optional[float] = Field(None, ge=0)
    default_count: Optional[int] = Field(None, ge=0)
    verification_status: Optional[str] = Field(None, pattern="^(pending|verified|rejected)$")
    verified_by: Optional[str] = None


class CreditProfileResponse(CreditProfileBase):
    id: int
    farmer_id: int
    verification_status: str
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionBase(BaseModel):
    transaction_type: str = Field(..., pattern="^(loan|repayment|default)$")
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    lender_name: Optional[str] = Field(None, max_length=200)


class TransactionCreate(TransactionBase):
    farmer_id: int


class TransactionResponse(TransactionBase):
    id: int
    farmer_id: int
    transaction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
