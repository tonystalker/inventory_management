from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, func
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(255), nullable=False)
    sku         = Column(String(100), unique=True, nullable=False, index=True)
    price       = Column(Numeric(10, 2), nullable=False)
    quantity    = Column(Integer, nullable=False, default=0)
    category    = Column(String(100), nullable=False, default="Home & Kitchen")
    segment     = Column(String(50), nullable=False, default="Economy")
    description = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
