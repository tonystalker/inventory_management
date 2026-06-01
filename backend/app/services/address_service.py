from typing import List
from fastapi import HTTPException, status
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate
from app.repositories.address_repository import AddressRepository
from app.repositories.customer_repository import CustomerRepository

class AddressService:
    def __init__(self, address_repo: AddressRepository, customer_repo: CustomerRepository):
        self.address_repo = address_repo
        self.customer_repo = customer_repo

    def get_by_customer(self, customer_id: int) -> List[Address]:
        customer = self.customer_repo.get_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        return self.address_repo.get_by_customer_id(customer_id)

    def create(self, customer_id: int, data: AddressCreate) -> Address:
        customer = self.customer_repo.get_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        
        address = Address(
            customer_id=customer_id,
            address_line=data.address_line,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
        )
        return self.address_repo.create(address)

    def update(self, id: int, data: AddressUpdate) -> Address:
        address = self.address_repo.get_by_id(id)
        if not address:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
        
        address.address_line = data.address_line
        address.city = data.city
        address.state = data.state
        address.pincode = data.pincode
        return self.address_repo.update(address)

    def delete(self, id: int) -> None:
        if not self.address_repo.delete(id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
