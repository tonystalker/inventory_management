from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.order_status import OrderStatus, STATUS_LABELS

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity:   int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int                   = Field(..., gt=0)
    items:       List[OrderItemCreate] = Field(..., min_length=1)

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderItemResponse(BaseModel):
    product_id:        int
    quantity:          int
    price_at_purchase: float

    model_config = {"from_attributes": True}

class OrderResponse(BaseModel):
    id:            int
    customer_id:   int
    total_amount:  float
    status:        OrderStatus
    status_label:  str             = ""   # human-readable e.g. "Picked & Packed"
    created_at:    datetime
    updated_at:    Optional[datetime] = None
    items:         List[OrderItemResponse] = []

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        # Auto-populate status_label from enum value
        self.status_label = STATUS_LABELS.get(self.status, self.status)
