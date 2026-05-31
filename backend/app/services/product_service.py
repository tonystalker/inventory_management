from typing import List
from sqlalchemy.exc import IntegrityError
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.product import Product
from app.exceptions import NotFoundError, DuplicateError

class ProductService:
    def __init__(self, repo: ProductRepository):
        self._repo = repo                      # DIP: depends on abstraction

    def get_all(self) -> List[Product]:
        return self._repo.get_all()

    def get_by_id(self, id: int) -> Product:
        product = self._repo.get_by_id(id)
        if not product:
            raise NotFoundError("Product", id)
        return product

    def create(self, data: ProductCreate) -> Product:
        try:
            return self._repo.create(data.model_dump())
        except IntegrityError:
            raise DuplicateError("sku", data.sku)

    def update(self, id: int, data: ProductUpdate) -> Product:
        product = self.get_by_id(id)
        try:
            return self._repo.update(product, data.model_dump(exclude_none=True))
        except IntegrityError:
            raise DuplicateError("sku", data.sku or "")

    def delete(self, id: int) -> None:
        if not self._repo.delete(id):
            raise NotFoundError("Product", id)

    def get_low_stock(self, threshold: int = 10) -> List[Product]:
        return self._repo.get_low_stock(threshold)
