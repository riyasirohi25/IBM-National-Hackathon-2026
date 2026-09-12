import os
from database import engine, Base
import models

# Drop all tables and recreate them
print("Dropping existing tables...")
Base.metadata.drop_all(bind=engine)

print("Creating tables...")
Base.metadata.create_all(bind=engine)

print("Database schema refreshed!")
