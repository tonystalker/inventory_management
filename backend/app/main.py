from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import products, customers, orders, dashboard
from app.exceptions.handlers import register_exception_handlers
import app.models  # noqa: F401 — ensure all models are imported before create_all

# Create tables (use Alembic for migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration — Load allowed domains dynamically from environment variables
import os

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "https://inventory-management-virid-nine.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if allowed_origins_raw:
    # Automatically strip leading/trailing whitespace and trailing slashes to prevent browser CORS mismatches
    origins.extend([origin.strip().rstrip("/") for origin in allowed_origins_raw.split(",") if origin.strip()])

# Remove duplicates
origins = list(set(origins))

from app.middleware import RateLimitMiddleware

# Apply IP-based Rate Limiting (100 requests per 60 seconds sliding window)
app.add_middleware(RateLimitMiddleware, limit=100, window=60)

# CORS Configuration — Load allowed domains dynamically from environment variables
# CORSMiddleware must be registered last (outermost) to cleanly answer preflight OPTIONS requests first
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
