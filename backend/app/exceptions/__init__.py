class NotFoundError(Exception):
    def __init__(self, resource: str, id: int):
        self.message = f"{resource} with id {id} not found."
        super().__init__(self.message)

class DuplicateError(Exception):
    def __init__(self, field: str, value: str):
        self.message = f"A record with {field} '{value}' already exists."
        super().__init__(self.message)

class InsufficientStockError(Exception):
    def __init__(self, sku: str, available: int, requested: int):
        self.message = (
            f"Insufficient stock for SKU '{sku}'. "
            f"Available: {available}, Requested: {requested}."
        )
        super().__init__(self.message)

class ValidationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class InvalidTransitionError(Exception):
    def __init__(self, current: str, requested: str, allowed: list[str]):
        allowed_str = ", ".join(allowed) if allowed else "none (terminal status)"
        self.message = (
            f"Cannot transition from '{current}' to '{requested}'. "
            f"Allowed next statuses: {allowed_str}."
        )
        super().__init__(self.message)
