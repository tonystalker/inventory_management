from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AddressBase(BaseModel):
    address_line: str = Field(..., min_length=5, max_length=500)
    city:         str = Field(..., min_length=2, max_length=100)
    state:        str = Field(..., min_length=2, max_length=100)
    pincode:      str = Field(..., min_length=3, max_length=20, pattern="^[0-9]+$") # Only numbers allowed as per requirement

class AddressCreate(AddressBase):
    pass

class AddressUpdate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id:          int
    customer_id: int
    created_at:  datetime

    model_config = {"from_attributes": True}
