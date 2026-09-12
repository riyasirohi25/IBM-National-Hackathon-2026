from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import logging

from database import get_db
from models import CreditProfile, Farmer
from schemas import CreditProfileCreate, CreditProfileUpdate, CreditProfileResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=CreditProfileResponse, status_code=status.HTTP_201_CREATED)
def create_credit_profile(profile: CreditProfileCreate, db: Session = Depends(get_db)):
    """Create a credit profile for a farmer"""
    try:
        # Check if farmer exists
        farmer = db.query(Farmer).filter(Farmer.id == profile.farmer_id).first()
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farmer with ID {profile.farmer_id} not found"
            )
        
        # Check if credit profile already exists
        existing_profile = db.query(CreditProfile).filter(
            CreditProfile.farmer_id == profile.farmer_id
        ).first()
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Credit profile already exists for this farmer"
            )
        
        # Create credit profile
        db_profile = CreditProfile(**profile.model_dump())
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        
        logger.info(f"Created credit profile for farmer ID: {profile.farmer_id}")
        return db_profile
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating credit profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create credit profile"
        )


@router.get("/", response_model=List[CreditProfileResponse])
def get_credit_profiles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all credit profiles with pagination"""
    try:
        profiles = db.query(CreditProfile).offset(skip).limit(limit).all()
        return profiles
    except Exception as e:
        logger.error(f"Error fetching credit profiles: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch credit profiles"
        )


@router.get("/farmer/{farmer_id}", response_model=CreditProfileResponse)
def get_credit_profile_by_farmer(farmer_id: int, db: Session = Depends(get_db)):
    """Get credit profile for a specific farmer"""
    try:
        profile = db.query(CreditProfile).filter(CreditProfile.farmer_id == farmer_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Credit profile not found for farmer ID {farmer_id}"
            )
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching credit profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch credit profile"
        )


@router.get("/{profile_id}", response_model=CreditProfileResponse)
def get_credit_profile(profile_id: int, db: Session = Depends(get_db)):
    """Get a specific credit profile by ID"""
    try:
        profile = db.query(CreditProfile).filter(CreditProfile.id == profile_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Credit profile with ID {profile_id} not found"
            )
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching credit profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch credit profile"
        )


@router.put("/{profile_id}", response_model=CreditProfileResponse)
def update_credit_profile(
    profile_id: int,
    profile_update: CreditProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update a credit profile"""
    try:
        db_profile = db.query(CreditProfile).filter(CreditProfile.id == profile_id).first()
        if not db_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Credit profile with ID {profile_id} not found"
            )
        
        # Update only provided fields
        update_data = profile_update.model_dump(exclude_unset=True)
        
        # If verification status is being updated to verified, set verified_at
        if "verification_status" in update_data and update_data["verification_status"] == "verified":
            update_data["verified_at"] = datetime.utcnow()
        
        for key, value in update_data.items():
            setattr(db_profile, key, value)
        
        db.commit()
        db.refresh(db_profile)
        
        logger.info(f"Updated credit profile ID: {profile_id}")
        return db_profile
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating credit profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update credit profile"
        )


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit_profile(profile_id: int, db: Session = Depends(get_db)):
    """Delete a credit profile"""
    try:
        db_profile = db.query(CreditProfile).filter(CreditProfile.id == profile_id).first()
        if not db_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Credit profile with ID {profile_id} not found"
            )
        
        db.delete(db_profile)
        db.commit()
        
        logger.info(f"Deleted credit profile ID: {profile_id}")
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting credit profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete credit profile"
        )
