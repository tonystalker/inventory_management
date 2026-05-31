from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.base import BaseRepository

class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Optional[Order]:
        return (
            self.db.query(Order)
            .options(joinedload(Order.items))
            .filter(Order.id == id)
            .first()
        )

    def get_all(self) -> List[Order]:
        return self.db.query(Order).options(joinedload(Order.items)).all()

    def create(self, order: Order) -> Order:
        self.db.add(order)
        self.db.flush()   # get order.id before commit (used within a transaction)
        return order

    def delete(self, id: int) -> bool:
        order = self.get_by_id(id)
        if not order:
            return False
        self.db.delete(order)
        self.db.commit()
        return True

    def count(self) -> int:
        return self.db.query(Order).count()
