# Models package — import all models here so SQLAlchemy registers them
from app.models.product import Product       # noqa: F401
from app.models.customer import Customer     # noqa: F401
from app.models.address import Address       # noqa: F401
from app.models.order import Order           # noqa: F401
from app.models.order_item import OrderItem  # noqa: F401
