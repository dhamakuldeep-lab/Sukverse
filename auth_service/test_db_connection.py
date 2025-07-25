import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()  # ensure .env is read

DATABASE_URL = os.getenv("DATABASE_URL")
print("Trying to connect to:", DATABASE_URL)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("✅ Successfully connected to the database!")
except Exception as e:
    print("❌ Connection failed:", e)
