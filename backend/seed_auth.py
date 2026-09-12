from database import SessionLocal, engine, Base
import auth_model
from auth_model import User
import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

db.query(User).delete()

users = [
    User(email="farmer@demo.com", password_hash=User.hash_password("demo123"), role="farmer", name="Ramesh Kumar", linked_id=1),
    User(email="fpo@demo.com", password_hash=User.hash_password("demo123"), role="fpo", name="Sahyadri FPO", linked_id=1),
    User(email="lender@demo.com", password_hash=User.hash_password("demo123"), role="lender", name="State Bank of India", linked_id=1),
]

db.add_all(users)
db.commit()
print("Demo users successfully seeded!")
