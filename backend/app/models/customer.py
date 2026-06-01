from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    phone      = Column(String(20))
    country    = Column(String(100), nullable=False, default="🇺🇸 USA")
    gender     = Column(String(50), nullable=False, default="Male")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    addresses  = relationship("Address", back_populates="customer", cascade="all, delete-orphan")
