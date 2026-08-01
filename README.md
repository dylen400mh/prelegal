# prelegal

> ⚠️ **Status: In progress.** This project is currently under active development and is expected to be completed within 1 week.

`prelegal` generates legal documents from a curated set of [Common Paper](https://github.com/CommonPaper) templates. The first tool is a **Mutual NDA creator**.

## Architecture

The app ships as a **single Docker container**:

- **`frontend/`** — Next.js (App Router) app, statically exported.
- **`backend/`** — FastAPI service (managed with `uv`) that serves the exported
  frontend and exposes `/api` (health + auth foundation). See `backend/README.md`.
- **Database** — SQLite, recreated from scratch every time the container starts.

## Quick start

Requires [Docker](https://docs.docker.com/get-docker/).

```bash
./scripts/start.sh     # build + run at http://localhost:8000  (Windows: scripts/start.ps1)
./scripts/stop.sh      # stop + remove the container            (Windows: scripts/stop.ps1)
```

See `scripts/README.md` for `PORT` / `JWT_SECRET` overrides.

## Local development

```bash
# Frontend (dev server with hot reload)
cd frontend && npm install && npm run dev

# Backend (dev server + tests)
cd backend && uv sync && uv run uvicorn app.main:app --reload
cd backend && uv run pytest
```
