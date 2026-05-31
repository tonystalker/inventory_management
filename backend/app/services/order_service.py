from typing import List
from sqlalchemy.orm import Session
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.customer_repository import CustomerRepository
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.order_status import OrderStatus
from app.schemas.order import OrderCreate
from app.services.order_status_service import OrderStatusService
from app.exceptions import NotFoundError, InsufficientStockError, InvalidTransitionError

class OrderService:
    """
    Orchestrates the full order placement lifecycle:
      1. Validate customer exists
      2. For each item: validate product, check stock
      3. Deduct stock atomically
      4. Snapshot price_at_purchase
      5. Calculate total_amount
      6. Persist order + items in a single transaction
    """

    def __init__(
        self,
        db: Session,
        order_repo: OrderRepository,
        product_repo: ProductRepository,
        customer_repo: CustomerRepository,
    ):
        self._db            = db
        self._order_repo    = order_repo
        self._product_repo  = product_repo
        self._customer_repo = customer_repo
        self._status_svc    = OrderStatusService()   # pure — no DB

    def get_all(self) -> List[Order]:
        return self._order_repo.get_all()

    def get_by_id(self, id: int) -> Order:
        order = self._order_repo.get_by_id(id)
        if not order:
            raise NotFoundError("Order", id)
        return order

    def create(self, data: OrderCreate) -> Order:
        customer = self._customer_repo.get_by_id(data.customer_id)
        if not customer:
            raise NotFoundError("Customer", data.customer_id)

        try:
            total_amount = 0.0
            order_items  = []

            for item_data in data.items:
                from app.models.product import Product
                product = (
                    self._db.query(Product)
                    .filter_by(id=item_data.product_id)
                    .with_for_update()
                    .first()
                )
                if not product:
                    raise NotFoundError("Product", item_data.product_id)

                if product.quantity < item_data.quantity:
                    raise InsufficientStockError(
                        product.sku, product.quantity, item_data.quantity
                    )

                product.quantity -= item_data.quantity
                total_amount     += float(product.price) * item_data.quantity

                order_items.append(OrderItem(
                    product_id        = product.id,
                    quantity          = item_data.quantity,
                    price_at_purchase = product.price,
                ))

            order = Order(
                customer_id  = data.customer_id,
                total_amount = round(total_amount, 2),
                status       = OrderStatus.PLACED,     # always starts as PLACED
                items        = order_items,
            )
            self._order_repo.create(order)
            self._db.commit()
            self._db.refresh(order)
            return order

        except Exception:
            self._db.rollback()
            raise

    def update_status(self, id: int, new_status: OrderStatus) -> Order:
        """
        Validates transition, applies it, and handles side effects
        (stock restoration on cancellation).
        """
        order = self.get_by_id(id)

        # Validate transition — raises InvalidTransitionError if illegal
        self._status_svc.validate_transition(order.status, new_status)

        try:
            # Side effect: restore stock only when cancelling
            if new_status == OrderStatus.CANCELLED:
                self._restore_stock(order)

            order.status = new_status
            self._db.commit()
            self._db.refresh(order)
            return order

        except Exception:
            self._db.rollback()
            raise

    def delete(self, id: int) -> None:
        """
        Hard delete — only allowed from terminal states or for admin use.
        For cancellation from UI, call update_status(id, CANCELLED) instead.
        """
        order = self.get_by_id(id)
        if not self._status_svc.is_terminal(order.status):
            # Auto-cancel first if not terminal
            self._status_svc.validate_transition(order.status, OrderStatus.CANCELLED)
            self._restore_stock(order)
        if not self._order_repo.delete(id):
            raise NotFoundError("Order", id)
        self._db.commit()

    def _restore_stock(self, order: Order) -> None:
        """Private helper — restores product quantities when order is cancelled."""
        for item in order.items:
            product = self._product_repo.get_by_id(item.product_id)
            if product:
                product.quantity += item.quantity
