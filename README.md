# Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **PostgreSQL**, **React**, and **Docker**.

## Live Demo

- **Frontend Application**: [https://inventory-management-virid-nine.vercel.app](https://inventory-management-virid-nine.vercel.app)
- **Backend API**: [https://inventory-management-tb9u.onrender.com](https://inventory-management-tb9u.onrender.com)

## System Architecture

```mermaid
flowchart TB
    User((User))

    subgraph "Frontend Layer (Vercel)"
        React[React SPA]
        Axios[Axios API Client]
        React --> Axios
    end

    subgraph "Backend API Layer (Render)"
        FastAPI[FastAPI]
        
        subgraph "Layered Architecture (SOLID)"
            Router[Routers]
            Service[Services]
            Repo[Repositories]
        end
        
        FastAPI --> Router
        Router --> Service
        Service --> Repo
    end

    subgraph "Data Layer (Render)"
        Postgres[(PostgreSQL)]
    end

    User --> React
    Axios -->|REST API| FastAPI
    Repo -->|SQLAlchemy| Postgres
```

## Database Schema (ER Diagram)

```mermaid
erDiagram
    CUSTOMERS {
        int id PK
        string name
        string email UK
        string phone
        string country
        string gender
        datetime created_at
    }

    PRODUCTS {
        int id PK
        string name
        string sku UK
        decimal price
        int quantity
        string category
        string segment
        text description
        datetime created_at
    }

    ORDERS {
        int id PK
        int customer_id FK
        decimal total_amount
        string status
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_at_purchase
    }

    CUSTOMERS ||--o{ ORDERS : "places"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "is part of"
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

- **Backend** → Hosted on [Render](https://render.com) at `https://inventory-management-tb9u.onrender.com`
- **Frontend** → Hosted on [Vercel](https://vercel.com) at `https://inventory-management-virid-nine.vercel.app`

## SOLID Principles

| Principle | Implementation |
|-----------|----------------|
| **S** — Single Responsibility | Router / Service / Repository each have one reason to change |
| **O** — Open/Closed | `BaseRepository` is open for extension (new entities), closed for modification |
| **L** — Liskov Substitution | All concrete repos can substitute `BaseRepository[T]` |
| **I** — Interface Segregation | `BaseRepository` defines minimal contract; domain-specific methods live only in the specific repo |
| **D** — Dependency Inversion | Services receive repos via constructor injection; FastAPI `Depends()` wires at runtime |
