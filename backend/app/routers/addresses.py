from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.repositories.address_repository import AddressRepository
from app.repositories.customer_repository import CustomerRepository
from app.services.address_service import AddressService
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse

router = APIRouter(tags=["Addresses"])

def get_service(db: Session = Depends(get_db)) -> AddressService:
    return AddressService(AddressRepository(db), CustomerRepository(db))

@router.post("/customers/{customer_id}/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(customer_id: int, data: AddressCreate, svc: AddressService = Depends(get_service)):
    return svc.create(customer_id, data)

@router.get("/customers/{customer_id}/addresses", response_model=List[AddressResponse])
def get_customer_addresses(customer_id: int, svc: AddressService = Depends(get_service)):
    return svc.get_by_customer(customer_id)

@router.put("/addresses/{id}", response_model=AddressResponse)
def update_address(id: int, data: AddressUpdate, svc: AddressService = Depends(get_service)):
    return svc.update(id, data)

@router.delete("/addresses/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(id: int, svc: AddressService = Depends(get_service)):
    svc.delete(id)
