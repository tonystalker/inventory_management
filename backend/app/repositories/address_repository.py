from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.address import Address
from app.repositories.base import BaseRepository

class AddressRepository(BaseRepository[Address]):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Optional[Address]:
        return self.db.query(Address).filter(Address.id == id).first()

    def get_by_customer_id(self, customer_id: int) -> List[Address]:
        return self.db.query(Address).filter(Address.customer_id == customer_id).all()

    def get_all(self) -> List[Address]:
        return self.db.query(Address).all()

    def create(self, address: Address) -> Address:
        self.db.add(address)
        self.db.commit()
        self.db.refresh(address)
        return address

    def update(self, address: Address) -> Address:
        self.db.commit()
        self.db.refresh(address)
        return address

    def delete(self, id: int) -> bool:
        address = self.get_by_id(id)
        if not address:
            return False
        self.db.delete(address)
        self.db.commit()
        return True

    def count(self) -> int:
        return self.db.query(Address).count()
