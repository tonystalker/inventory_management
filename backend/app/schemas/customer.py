from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class CustomerCreate(BaseModel):
    name:    str      = Field(..., min_length=1, max_length=255)
    email:   EmailStr
    phone:   Optional[str] = Field(None, max_length=20)
    country: str      = Field(default="🇺🇸 USA")
    gender:  str      = Field(default="Male")

class CustomerResponse(BaseModel):
    id:         int
    name:       str
    email:      str
    phone:      Optional[str]
    country:    str
    gender:     str
    created_at: datetime

    model_config = {"from_attributes": True}
