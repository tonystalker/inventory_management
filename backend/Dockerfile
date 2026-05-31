# --- Stage 1: builder ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies into a virtual environment
COPY requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# --- Stage 2: runtime ---
FROM python:3.11-slim

WORKDIR /app

# Copy venv from builder (keeps image slim)
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy app source
COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
