from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.repositories.product_repository import ProductRepository
from app.services.product_service import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

def get_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, svc: ProductService = Depends(get_service)):
    return svc.create(data)

@router.get("/", response_model=List[ProductResponse])
@router.get("", response_model=List[ProductResponse])
def list_products(svc: ProductService = Depends(get_service)):
    return svc.get_all()

@router.get("/{id}", response_model=ProductResponse)
def get_product(id: int, svc: ProductService = Depends(get_service)):
    return svc.get_by_id(id)

@router.put("/{id}", response_model=ProductResponse)
def update_product(id: int, data: ProductUpdate, svc: ProductService = Depends(get_service)):
    return svc.update(id, data)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, svc: ProductService = Depends(get_service)):
    svc.delete(id)
