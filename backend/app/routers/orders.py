from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.customer_repository import CustomerRepository
from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.models.order_status import OrderStatus, VALID_TRANSITIONS, STATUS_LABELS

router = APIRouter(prefix="/orders", tags=["Orders"])

def get_service(db: Session = Depends(get_db)) -> OrderService:
    return OrderService(
        db=db,
        order_repo=OrderRepository(db),
        product_repo=ProductRepository(db),
        customer_repo=CustomerRepository(db),
    )

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, svc: OrderService = Depends(get_service)):
    return svc.create(data)

@router.get("/", response_model=List[OrderResponse])
def list_orders(svc: OrderService = Depends(get_service)):
    return svc.get_all()

@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, svc: OrderService = Depends(get_service)):
    return svc.get_by_id(id)

@router.patch("/{id}/status", response_model=OrderResponse)
def update_order_status(
    id: int,
    data: OrderStatusUpdate,
    svc: OrderService = Depends(get_service),
):
    """
    Advance or change the order status.
    Only transitions listed in VALID_TRANSITIONS are accepted.
    Returns 409 Conflict for illegal transitions.
    """
    return svc.update_status(id, data.status)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: int, svc: OrderService = Depends(get_service)):
    svc.delete(id)

# Utility endpoint — lets frontend know what transitions are available for a given order
@router.get("/{id}/status/next", response_model=List[dict])
def get_next_statuses(id: int, svc: OrderService = Depends(get_service)):
    order   = svc.get_by_id(id)
    allowed = VALID_TRANSITIONS.get(order.status, [])
    return [{"value": s.value, "label": STATUS_LABELS[s]} for s in allowed]
