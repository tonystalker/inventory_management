from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.product import Product
from app.repositories.base import BaseRepository

class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: Session):
        super().__init__(db, Product)

    def get_by_sku(self, sku: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.sku == sku).first()

    def get_low_stock(self, threshold: int = 10) -> List[Product]:
        return self.db.query(Product).filter(Product.quantity <= threshold).all()
