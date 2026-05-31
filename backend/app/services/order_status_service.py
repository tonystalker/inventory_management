from app.models.order_status import OrderStatus, VALID_TRANSITIONS, STATUS_LABELS
from app.exceptions import InvalidTransitionError

class OrderStatusService:
    """
    Pure business logic — no DB access.
    Validates whether a status transition is legal.
    """

    def validate_transition(self, current: OrderStatus, requested: OrderStatus) -> None:
        """
        Raises InvalidTransitionError if the transition is not allowed.
        """
        allowed = VALID_TRANSITIONS.get(current, [])
        if requested not in allowed:
            raise InvalidTransitionError(
                current=STATUS_LABELS[current],
                requested=STATUS_LABELS[requested],
                allowed=[STATUS_LABELS[s] for s in allowed],
            )

    def is_terminal(self, status: OrderStatus) -> bool:
        return len(VALID_TRANSITIONS.get(status, [])) == 0

    def get_allowed_next(self, current: OrderStatus) -> list[OrderStatus]:
        return VALID_TRANSITIONS.get(current, [])
