from typing import List
from sqlalchemy.exc import IntegrityError
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import CustomerCreate
from app.models.customer import Customer
from app.exceptions import NotFoundError, DuplicateError

class CustomerService:
    def __init__(self, repo: CustomerRepository):
        self._repo = repo

    def get_all(self) -> List[Customer]:
        return self._repo.get_all()

    def get_by_id(self, id: int) -> Customer:
        customer = self._repo.get_by_id(id)
        if not customer:
            raise NotFoundError("Customer", id)
        return customer

    def create(self, data: CustomerCreate) -> Customer:
        try:
            return self._repo.create(data.model_dump())
        except IntegrityError:
            raise DuplicateError("email", data.email)

    def delete(self, id: int) -> None:
        if not self._repo.delete(id):
            raise NotFoundError("Customer", id)
