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

    ADDRESSES {
        int id PK
        int customer_id FK
        string address_line
        string city
        string state
        string pincode
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
        string shipping_address
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

    CUSTOMERS ||--o{ ADDRESSES : "has"
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

## Detailed API Endpoints

### 🩺 System & Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/health` | Returns the health status of the backend server. |
| **GET** | `/dashboard/stats` | Retrieves high-level business metrics (total sales, revenue, low stock alerts). |

### 📦 Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/products/` | Lists all products in the inventory. |
| **GET** | `/products/{id}` | Retrieves detailed information for a specific product. |
| **POST** | `/products/` | Creates a new product in the inventory. |
| **PUT** | `/products/{id}` | Updates an existing product's details or stock. |
| **DELETE** | `/products/{id}` | Deletes a product from the database. |

### 👥 Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/customers/` | Lists all registered customers. |
| **GET** | `/customers/{id}` | Retrieves a specific customer's profile. |
| **POST** | `/customers/` | Registers a new customer. |
| **PUT** | `/customers/{id}` | Updates customer information. |
| **DELETE** | `/customers/{id}` | Deletes a customer profile. |

### 📍 Addresses
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/customers/{id}/addresses` | Lists all addresses for a specific customer. |
| **POST** | `/customers/{id}/addresses` | Creates a new saved address for a customer. |
| **PUT** | `/addresses/{id}` | Updates an existing address. |
| **DELETE** | `/addresses/{id}` | Deletes a saved address. |

### 🛒 Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/orders/` | Lists all orders along with their current status. |
| **GET** | `/orders/{id}` | Retrieves a specific order and its purchased items. |
| **POST** | `/orders/` | Creates a new order (automatically locks in product purchase prices). |
| **DELETE** | `/orders/{id}` | Cancels/Deletes an order. |

**Interactive Docs:** You can test all of these endpoints directly using the auto-generated Swagger UI at `https://inventory-management-tb9u.onrender.com/docs` or `http://localhost:8000/docs` locally!

## Deployment

- **Backend** → Hosted on [Render](https://render.com) at `https://inventory-management-tb9u.onrender.com`
- **Frontend** → Hosted on [Vercel](https://vercel.com) at `https://inventory-management-virid-nine.vercel.app`

## Security, Reliability & Rate Limiting

We have integrated several industry best practices to ensure the API is error-free, resilient to attacks, and immune to abuse:

- **Error-Free Execution (Global Exception Handling):** A centralized exception handler intercepts all database and business logic errors (like `ItemNotFound`, `ValidationError`), preventing the application from crashing. It automatically formats these exceptions into clean, uniform HTTP JSON responses for the frontend.
- **Attack Prevention (SQL Injection & XSS):** 
  - We strictly use **SQLAlchemy ORM**, which parametrizes all database queries natively, completely eliminating the risk of SQL injection.
  - The React frontend escapes all text inputs automatically to prevent Cross-Site Scripting (XSS).
- **Rate Limiting (DDoS & Spam Protection):** A custom `RateLimitMiddleware` enforces a strict threshold of **100 requests per 60 seconds** per IP address using a sliding window algorithm. This prevents automated scripts or malicious actors from spamming or bringing down the server.
- **CORS Hardening:** Cross-Origin Resource Sharing (CORS) is strictly configured to only allow requests from the exact Vercel frontend URL, preventing third-party websites from making unauthorized API calls on behalf of users.

## SOLID Principles

| Principle | Implementation |
|-----------|----------------|
| **S** — Single Responsibility | Router / Service / Repository each have one reason to change |
| **O** — Open/Closed | `BaseRepository` is open for extension (new entities), closed for modification |
| **L** — Liskov Substitution | All concrete repos can substitute `BaseRepository[T]` |
| **I** — Interface Segregation | `BaseRepository` defines minimal contract; domain-specific methods live only in the specific repo |
| **D** — Dependency Inversion | Services receive repos via constructor injection; FastAPI `Depends()` wires at runtime |
