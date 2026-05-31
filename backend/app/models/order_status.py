import enum

class OrderStatus(str, enum.Enum):
    PLACED       = "placed"
    PROCESSING   = "processing"
    PICKED_PACKED = "picked_packed"
    SHIPPED      = "shipped"
    DELIVERED    = "delivered"
    RETURNED     = "returned"
    CANCELLED    = "cancelled"

# Human-readable labels for API responses / frontend display
STATUS_LABELS: dict[OrderStatus, str] = {
    OrderStatus.PLACED:        "Placed",
    OrderStatus.PROCESSING:    "Processing",
    OrderStatus.PICKED_PACKED: "Picked & Packed",
    OrderStatus.SHIPPED:       "Shipped",
    OrderStatus.DELIVERED:     "Delivered",
    OrderStatus.RETURNED:      "Returned",
    OrderStatus.CANCELLED:     "Cancelled",
}

# Ordered pipeline (for stepper UI)
STATUS_PIPELINE = [
    OrderStatus.PLACED,
    OrderStatus.PROCESSING,
    OrderStatus.PICKED_PACKED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
]

# Valid forward/backward transitions
VALID_TRANSITIONS: dict[OrderStatus, list[OrderStatus]] = {
    OrderStatus.PLACED:        [OrderStatus.PROCESSING,   OrderStatus.CANCELLED],
    OrderStatus.PROCESSING:    [OrderStatus.PICKED_PACKED, OrderStatus.CANCELLED],
    OrderStatus.PICKED_PACKED: [OrderStatus.SHIPPED],
    OrderStatus.SHIPPED:       [OrderStatus.DELIVERED],
    OrderStatus.DELIVERED:     [OrderStatus.RETURNED],
    OrderStatus.RETURNED:      [],
    OrderStatus.CANCELLED:     [],
}
