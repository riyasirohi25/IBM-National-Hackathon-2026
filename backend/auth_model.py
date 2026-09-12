import hashlib, uuid, datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role          = Column(String, nullable=False)   # farmer | fpo | lender
    name          = Column(String, nullable=True)
    linked_id     = Column(Integer, nullable=True)   # farmer.id / lender_id / fpo_id
    token         = Column(String, nullable=True)    # simple session token
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    @staticmethod
    def hash_password(pwd: str) -> str:
        return hashlib.sha256(pwd.encode()).hexdigest()

    def check_password(self, pwd: str) -> bool:
        return self.password_hash == hashlib.sha256(pwd.encode()).hexdigest()

    def new_token(self) -> str:
        self.token = str(uuid.uuid4())
        return self.token
