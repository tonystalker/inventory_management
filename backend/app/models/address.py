from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Address(Base):
    __tablename__ = "addresses"

    id           = Column(Integer, primary_key=True, index=True)
    customer_id  = Column(Integer, ForeignKey("customers.id"), nullable=False)
    address_line = Column(String(500), nullable=False)
    city         = Column(String(100), nullable=False)
    state        = Column(String(100), nullable=False)
    pincode      = Column(String(20), nullable=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    customer     = relationship("Customer", back_populates="addresses")
