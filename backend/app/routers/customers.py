from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.repositories.customer_repository import CustomerRepository
from app.services.customer_service import CustomerService
from app.schemas.customer import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])

def get_service(db: Session = Depends(get_db)) -> CustomerService:
    return CustomerService(CustomerRepository(db))

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(data: CustomerCreate, svc: CustomerService = Depends(get_service)):
    return svc.create(data)

@router.get("/", response_model=List[CustomerResponse])
def list_customers(svc: CustomerService = Depends(get_service)):
    return svc.get_all()

@router.get("/{id}", response_model=CustomerResponse)
def get_customer(id: int, svc: CustomerService = Depends(get_service)):
    return svc.get_by_id(id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: int, svc: CustomerService = Depends(get_service)):
    svc.delete(id)
