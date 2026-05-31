from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ProductCreate(BaseModel):
    name:        str     = Field(..., min_length=1, max_length=255)
    sku:         str     = Field(..., min_length=1, max_length=100)
    price:       Decimal = Field(..., ge=0)
    quantity:    int     = Field(..., ge=0)
    category:    str     = Field(default="Home & Kitchen")
    segment:     str     = Field(default="Economy")
    description: Optional[str] = Field(None)

class ProductUpdate(BaseModel):
    name:        Optional[str]     = Field(None, min_length=1, max_length=255)
    sku:         Optional[str]     = Field(None, min_length=1, max_length=100)
    price:       Optional[Decimal] = Field(None, ge=0)
    quantity:    Optional[int]     = Field(None, ge=0)
    category:    Optional[str]     = Field(None)
    segment:     Optional[str]     = Field(None)
    description: Optional[str]     = Field(None)

class ProductResponse(BaseModel):
    id:          int
    name:        str
    sku:         str
    price:       float
    quantity:    int
    category:    str
    segment:     str
    description: Optional[str] = None
    created_at:  datetime

    model_config = {"from_attributes": True}


