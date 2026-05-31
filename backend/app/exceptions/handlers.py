from fastapi import Request
from fastapi.responses import JSONResponse
from app.exceptions import (
    NotFoundError,
    DuplicateError,
    InsufficientStockError,
    InvalidTransitionError,
    ValidationError,
)

def register_exception_handlers(app):
    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content={"error": "NotFound", "message": exc.message})

    @app.exception_handler(DuplicateError)
    async def duplicate_handler(request: Request, exc: DuplicateError):
        return JSONResponse(status_code=409, content={"error": "Conflict", "message": exc.message})

    @app.exception_handler(InsufficientStockError)
    async def stock_handler(request: Request, exc: InsufficientStockError):
        return JSONResponse(status_code=400, content={"error": "InsufficientStock", "message": exc.message})

    @app.exception_handler(ValidationError)
    async def validation_handler(request: Request, exc: ValidationError):
        return JSONResponse(status_code=422, content={"error": "ValidationError", "message": exc.message})

    @app.exception_handler(InvalidTransitionError)
    async def transition_handler(request: Request, exc: InvalidTransitionError):
        return JSONResponse(status_code=409, content={"error": "InvalidTransition", "message": exc.message})
