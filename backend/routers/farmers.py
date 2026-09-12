from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from database import get_db
from models import Farmer, CreditProfile
from schemas import FarmerCreate, FarmerUpdate, FarmerResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
def create_farmer(farmer: FarmerCreate, db: Session = Depends(get_db)):
    """Create a new farmer"""
    try:
        # Check if farmer_id already exists
        existing_farmer = db.query(Farmer).filter(Farmer.farmer_id == farmer.farmer_id).first()
        if existing_farmer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Farmer with ID {farmer.farmer_id} already exists"
            )
        
        # Check if phone number already exists
        existing_phone = db.query(Farmer).filter(Farmer.phone_number == farmer.phone_number).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
        
        # Check if email already exists (if provided)
        if farmer.email:
            existing_email = db.query(Farmer).filter(Farmer.email == farmer.email).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Create new farmer
        db_farmer = Farmer(**farmer.model_dump())
        db.add(db_farmer)
        db.commit()
        db.refresh(db_farmer)
        
        # Create default credit profile
        credit_profile = CreditProfile(farmer_id=db_farmer.id)
        db.add(credit_profile)
        db.commit()
        
        logger.info(f"Created farmer: {db_farmer.farmer_id}")
        return db_farmer
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating farmer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create farmer"
        )


@router.get("/", response_model=List[FarmerResponse])
def get_farmers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all farmers with pagination"""
    try:
        farmers = db.query(Farmer).offset(skip).limit(limit).all()
        return farmers
    except Exception as e:
        logger.error(f"Error fetching farmers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch farmers"
        )


@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(farmer_id: str, db: Session = Depends(get_db)):
    """Get a specific farmer by farmer_id"""
    try:
        farmer = db.query(Farmer).filter(Farmer.farmer_id == farmer_id).first()
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farmer with ID {farmer_id} not found"
            )
        return farmer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching farmer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch farmer"
        )


@router.put("/{farmer_id}", response_model=FarmerResponse)
def update_farmer(farmer_id: str, farmer_update: FarmerUpdate, db: Session = Depends(get_db)):
    """Update a farmer's information"""
    try:
        db_farmer = db.query(Farmer).filter(Farmer.farmer_id == farmer_id).first()
        if not db_farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farmer with ID {farmer_id} not found"
            )
        
        # Update only provided fields
        update_data = farmer_update.model_dump(exclude_unset=True)
        
        # Check for duplicate phone number
        if "phone_number" in update_data:
            existing_phone = db.query(Farmer).filter(
                Farmer.phone_number == update_data["phone_number"],
                Farmer.id != db_farmer.id
            ).first()
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered"
                )
        
        # Check for duplicate email
        if "email" in update_data and update_data["email"]:
            existing_email = db.query(Farmer).filter(
                Farmer.email == update_data["email"],
                Farmer.id != db_farmer.id
            ).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        for key, value in update_data.items():
            setattr(db_farmer, key, value)
        
        db.commit()
        db.refresh(db_farmer)
        
        logger.info(f"Updated farmer: {farmer_id}")
        return db_farmer
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating farmer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update farmer"
        )


@router.delete("/{farmer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer(farmer_id: str, db: Session = Depends(get_db)):
    """Delete a farmer"""
    try:
        db_farmer = db.query(Farmer).filter(Farmer.farmer_id == farmer_id).first()
        if not db_farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farmer with ID {farmer_id} not found"
            )
        
        db.delete(db_farmer)
        db.commit()
        
        logger.info(f"Deleted farmer: {farmer_id}")
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting farmer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete farmer"
        )
