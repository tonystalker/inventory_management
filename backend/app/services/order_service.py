from typing import List
from sqlalchemy.orm import Session
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.address_repository import AddressRepository
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.order_status import OrderStatus
from app.schemas.order import OrderCreate
from app.services.order_status_service import OrderStatusService
from app.exceptions import NotFoundError, InsufficientStockError, InvalidTransitionError

class OrderService:
    """
    Handles the order placement lifecycle.
    """

    def __init__(
        self,
        db: Session,
        order_repo: OrderRepository,
        product_repo: ProductRepository,
        customer_repo: CustomerRepository,
        address_repo: AddressRepository,
    ):
        self._db            = db
        self._order_repo    = order_repo
        self._product_repo  = product_repo
        self._customer_repo = customer_repo
        self._address_repo  = address_repo
        self._status_svc    = OrderStatusService()

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

        address = self._address_repo.get_by_id(data.shipping_address_id)
        if not address or address.customer_id != data.customer_id:
            raise NotFoundError("Address for Customer", data.shipping_address_id)

        shipping_address_snapshot = f"{address.address_line}, {address.city}, {address.state} - {address.pincode}"

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
                customer_id      = data.customer_id,
                shipping_address = shipping_address_snapshot,
                total_amount     = round(total_amount, 2),
                status           = OrderStatus.PLACED,
                items            = order_items,
            )
            self._order_repo.create(order)
            self._db.commit()
            self._db.refresh(order)
            return order

        except Exception:
            self._db.rollback()
            raise

    def update_status(self, id: int, new_status: OrderStatus) -> Order:
        """ Update order status safely """
        order = self.get_by_id(id)

        self._status_svc.validate_transition(order.status, new_status)

        try:
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
        order = self.get_by_id(id)
        if not self._status_svc.is_terminal(order.status):
            self._status_svc.validate_transition(order.status, OrderStatus.CANCELLED)
            self._restore_stock(order)
        if not self._order_repo.delete(id):
            raise NotFoundError("Order", id)
        self._db.commit()

    def _restore_stock(self, order: Order) -> None:
        """ Restore stock on cancellation """
        for item in order.items:
            product = self._product_repo.get_by_id(item.product_id)
            if product:
                product.quantity += item.quantity
