import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from collections import defaultdict
import threading

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window: int = 60):
        """
        :param limit: Maximum number of requests allowed in the window.
        :param window: Time window in seconds.
        """
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)
        self.lock = threading.Lock()

    async def dispatch(self, request: Request, call_next) -> Response:
        # Exclude internal health checks or swagger documentation if needed
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        with self.lock:
            # Filter out timestamps older than the sliding window
            self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window]
            
            # Check limit
            if len(self.requests[client_ip]) >= self.limit:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."},
                    headers={"Retry-After": str(int(self.window))}
                )
            
            # Record current request timestamp
            self.requests[client_ip].append(now)

        return await call_next(request)
