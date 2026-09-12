import hashlib
from sqlalchemy.orm import Session
from models import AuditLog

def append_audit_log(db: Session, farmer_id: int, event_str: str):
    last_log = db.query(AuditLog).filter(AuditLog.farmer_id == farmer_id).order_by(AuditLog.id.desc()).first()
    last_hash = last_log.hash_value if last_log else "genesis"
    
    new_hash = hashlib.sha256((event_str + last_hash).encode()).hexdigest()
    
    new_log = AuditLog(farmer_id=farmer_id, event=event_str, hash_value=new_hash)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

def get_audit_logs(db: Session, farmer_id: int):
    return db.query(AuditLog).filter(AuditLog.farmer_id == farmer_id).order_by(AuditLog.id.asc()).all()
