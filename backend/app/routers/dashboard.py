from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.repositories.product_repository import ProductRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.product import ProductResponse
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

class DashboardStats(BaseModel):
    total_products:     int
    total_customers:    int
    total_orders:       int
    low_stock_products: List[ProductResponse]

@router.get("/", response_model=DashboardStats)
@router.get("", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    product_repo  = ProductRepository(db)
    customer_repo = CustomerRepository(db)
    order_repo    = OrderRepository(db)

    return DashboardStats(
        total_products     = len(product_repo.get_all()),
        total_customers    = len(customer_repo.get_all()),
        total_orders       = order_repo.count(),
        low_stock_products = product_repo.get_low_stock(threshold=10),
    )
