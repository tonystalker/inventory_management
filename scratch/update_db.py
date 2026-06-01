import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    # Adding the new column with a default value so existing rows don't fail the NOT NULL constraint
    db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(500) NOT NULL DEFAULT 'No Shipping Address Provided'"))
    db.commit()
    print("Database altered successfully")
except Exception as e:
    db.rollback()
    print(f"Error altering database: {e}")
finally:
    db.close()
