# syntax=docker/dockerfile:1

# --- Stage 1: build the frontend to a static export (frontend/out) ---
FROM node:24-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: backend that serves /api and the static frontend ---
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS backend
WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Install dependencies first (cached) then the project.
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY backend/ ./
RUN uv sync --frozen --no-dev

# The compiled frontend served as the catch-all route.
COPY --from=frontend /frontend/out ./static

ENV FRONTEND_DIST=/app/static \
    DB_PATH=/app/prelegal.db

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
