# Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **PostgreSQL**, **React**, and **Docker**.

## Architecture

```
3-Tier Layered Architecture (SOLID principles)
Router → Service → Repository → Database
```

## Quick Start (Docker)

```bash
# 1. Clone and enter directory
cd "inventory management"

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your values if needed

# 3. Build and start all services
docker compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:8000
#   API Docs  → http://localhost:8000/docs
#   Postgres  → localhost:5432
```

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Set DATABASE_URL in .env
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/ims_db" > .env

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env         # Edit VITE_API_BASE_URL if needed
npm install
npm run dev
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/dashboard` | Stats + low stock |
| POST/GET/PUT/DELETE | `/products` | Product CRUD |
| POST/GET/DELETE | `/customers` | Customer CRUD |
| POST/GET/DELETE | `/orders` | Order management |

Full interactive docs: **http://localhost:8000/docs**

## Deployment

- **Backend** → [Render](https://render.com) (Web Service, Python 3, root dir: `backend`)
- **Frontend** → [Vercel](https://vercel.com) (root dir: `frontend`, set `VITE_API_BASE_URL`)

## SOLID Principles

| Principle | Implementation |
|-----------|----------------|
| **S** — Single Responsibility | Router / Service / Repository each have one reason to change |
| **O** — Open/Closed | `BaseRepository` is open for extension (new entities), closed for modification |
| **L** — Liskov Substitution | All concrete repos can substitute `BaseRepository[T]` |
| **I** — Interface Segregation | `BaseRepository` defines minimal contract; domain-specific methods live only in the specific repo |
| **D** — Dependency Inversion | Services receive repos via constructor injection; FastAPI `Depends()` wires at runtime |
