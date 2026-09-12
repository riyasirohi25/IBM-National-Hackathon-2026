from pydantic import BaseModel
from typing import Optional, List

class EvidenceBase(BaseModel):
    claim: str
    value: float
    unit: str
    source: str
    
class EvidenceCreate(EvidenceBase):
    pass

class Evidence(EvidenceBase):
    id: int
    farmer_id: int
    confidence: float
    conflict: bool

    class Config:
        from_attributes = True

class AttestationCreate(BaseModel):
    fpo_member_id: int
    claim: str
    value: Optional[float] = None

class Attestation(AttestationCreate):
    id: int
    farmer_id: int

    class Config:
        from_attributes = True

class ConsentCreate(BaseModel):
    lender_id: int
    granted: bool

class Consent(ConsentCreate):
    id: int
    farmer_id: int

    class Config:
        from_attributes = True

class AuditLogBase(BaseModel):
    event: str
    hash_value: str

class AuditLog(AuditLogBase):
    id: int
    farmer_id: int

    class Config:
        from_attributes = True

class FarmerBase(BaseModel):
    name: str
    fpo_id: int
    location: str

class FarmerCreate(FarmerBase):
    pass

class Farmer(FarmerBase):
    id: int
    
    class Config:
        from_attributes = True
