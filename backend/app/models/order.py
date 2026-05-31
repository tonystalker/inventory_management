from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.order_status import OrderStatus

class Order(Base):
    __tablename__ = "orders"

    id           = Column(Integer, primary_key=True, index=True)
    customer_id  = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status       = Column(
        String(50),
        nullable=False,
        default="placed",
    )
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")
    items    = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
