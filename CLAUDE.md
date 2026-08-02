# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`prelegal` generates legal documents from a curated set of [Common Paper](https://github.com/CommonPaper) templates. The first (and currently only) implemented tool is a **Mutual NDA creator** — a Next.js frontend where the user builds a Common Paper Mutual NDA by chatting with an AI, then downloads it as a PDF.

As of **PL-4**, the V1 technical foundation is in place: the frontend is statically exported and served by a FastAPI backend that also exposes an `/api` surface (health + an auth foundation over a temporary SQLite DB), the whole app ships as a single Docker container, and `scripts/` brings it up/down cross-platform.

As of **PL-5**, the NDA is filled in via a **freeform AI chat** instead of a form. The chat runs client-side but calls `POST /api/chat` on the backend, which uses an LLM (LiteLLM → OpenRouter → Cerebras, structured outputs) to interview the user and return the updated document. The live preview and PDF are unchanged and still render from the same `MndaData`.

Work is tracked with `PL-<n>` ticket prefixes on commits/branches.

## Development process

Every feature follows this end-to-end flow:

1. **Read the ticket.** Use the Atlassian MCP tools (`getJiraIssue`, `searchJiraIssuesUsingJql`, etc.) to pull the feature instructions and acceptance criteria from Jira (the `PL-<n>` ticket).
2. **Develop the feature** using the `feature-dev` skill and do not skip any of its 7 phases: (1) Discovery, (2) Codebase Exploration, (3) Clarifying Questions, (4) Architecture Design, (5) Implementation, (6) Quality Review, (7) Summary.
3. **Test thoroughly** with both unit tests and integration tests; run them and fix any issues before moving on.
4. **Open a PR** using the GitHub MCP tools (`create_pull_request`).
5. **Update @CLAUDE.md** with changes that were made and to remove/update anything that is no longer accurate.

## AI design

When writing code that calls an LLM (to interpret input and populate fields in a legal document):

- Route calls through **LiteLLM** via **OpenRouter** to the **`openrouter/openai/gpt-oss-120b`** model, with **Cerebras** as the interface/inference provider. Use the `cerebras` skill for the setup and call conventions.
- Always use **structured outputs** so responses can be parsed and mapped directly onto the document's fields.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Repository layout

- `templates/` — Common Paper legal document templates as Markdown (verbatim, CC BY 4.0). Source-of-truth legal text; do not paraphrase.
- `catalog.json` — machine-readable index of the templates (name, description, filename).
- `frontend/` — the Next.js 15 (App Router) + React 19 + Tailwind v4 app. Statically exported (`output: "export"` → `out/`) and served by the backend.
- `backend/` — the FastAPI service, a `uv` project (see Technical design).
- `scripts/` — cross-platform start/stop scripts wrapping the Docker container (see Technical design).

## Technical design

Implemented in PL-4.

- **Packaging:** the entire project ships as a single **Docker container** (root `Dockerfile`, multi-stage: a Node stage builds the frontend export, a Python/`uv` stage installs the backend and serves everything on one port, `8000`).
- **Backend:** lives in `backend/`, a **`uv`** project built on **FastAPI**. See `backend/README.md`. It serves the exported frontend as the catch-all route and mounts the API under `/api` (routers registered before the static mount so `/api` is never shadowed).
- **Frontend:** lives in `frontend/`. **Statically exported and served from FastAPI** — the app is fully client-side, so `output: "export"` works. In the container the export is copied to `backend/static/` (pointed at by `FRONTEND_DIST`).
- **Database:** SQLite, **recreated from scratch on every startup** (`init_db()` drops + recreates all tables). Backend-only auth foundation today: `POST /api/auth/signup`, `POST /api/auth/signin`, `GET /api/auth/me`, with bcrypt-hashed passwords and JWT over a `users` table. Sign-in/sign-up **screens** and document storage come in **PL-7**.
- **NDA chat (PL-5):** `POST /api/chat` (`backend/app/routers/chat.py`) is a **stateless** endpoint — the frontend sends the conversation and the current document, and it returns `{reply, data}`. It calls the LLM per the AI-design section, with the prompt built in `app/nda_chat.py` and structured-output/request models in `app/schemas.py` (a camelCase-aliased `MndaDocument` mirroring the frontend `MndaData`). Unauthenticated for now; add `Depends(get_current_user)` in PL-7.
- **Scripts:** `scripts/` holds **start/stop** scripts covering **macOS, Windows, and Linux** (`.sh` + `.ps1`) that build/run and stop/remove the container. `PORT`, `JWT_SECRET`, and `OPENROUTER_API_KEY` are overridable (see `scripts/README.md`); `start.sh`/`start.ps1` also read the repo-root `.env`.

Configuration is via env / `backend/.env.example` (`JWT_SECRET`, `DB_PATH`, `FRONTEND_DIST`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `OPENROUTER_API_KEY`). `Settings` reads both the repo-root `.env` (where `OPENROUTER_API_KEY` lives) and `backend/.env`. `JWT_SECRET` has an insecure dev default that **must** be overridden in production.

## Commands

**Full app (single container)** — from the repo root, requires Docker:

```bash
./scripts/start.sh   # build + run at http://localhost:8000  (Windows: scripts/start.ps1)
./scripts/stop.sh    # stop + remove the container            (Windows: scripts/stop.ps1)
```

**Frontend** — from `frontend/`:

```bash
npm run dev          # dev server at http://localhost:3000
npm run build        # production build → static export in out/
npm run lint         # next lint
npm test             # vitest run (once)
npm run test:watch   # vitest watch mode
npx vitest run path/to/file.test.ts   # run a single test file
```

**Backend** — from `backend/`, requires [`uv`](https://docs.astral.sh/uv/):

```bash
uv sync                                  # install deps (incl. dev group)
uv run uvicorn app.main:app --reload     # dev server at http://localhost:8000
uv run pytest                            # run the backend test suite
```

## Frontend architecture

The MNDA is composed of two parts: a **Cover Page** (values gathered from the user) plus the **static Common Paper Standard Terms**. The code is organized around keeping the on-screen preview and the downloaded PDF from ever drifting apart.

- `nda/types.ts` — `MndaData`, the single data model for the whole feature, plus `DEFAULT_MNDA`. Term/confidentiality each have a mode discriminant (`expires`|`untilTerminated`, `years`|`perpetuity`).
- `nda/terms.ts` — the Standard Terms embedded verbatim as a structured `STANDARD_TERMS` array (11 sections) plus attribution. Sourced from `templates/mutual-nda.md`; keep the legal text exact.
- `nda/format.ts` — **the shared presentation layer.** `coverFields()` and `signatureRows()` turn `MndaData` into ordered label/value rows. Both the HTML preview and the PDF read from these helpers, so all display logic (date formatting, singular/plural years, `[Bracketed]` placeholder fallbacks for empty fields) lives here and only here. Change display behavior here, not in the components.
- `nda/chat.ts` — thin client for `POST /api/chat` (`ChatMessage` type + `sendChat()`), using a relative URL so it works same-origin in the container.
- `components/NdaChat.tsx` — the chat panel and the single owner of edits (PL-5). Holds the conversation in local state; each turn calls `sendChat` and pushes the returned `MndaData` up via `onChange`. State lives in `app/page.tsx` (`useState<MndaData>`) and flows down to both renderers. Same `{ data, onChange }` contract the old `NdaForm` had.
- `components/NdaPreview.tsx` — HTML/Tailwind rendering, consumes `coverFields`/`signatureRows`.
- `components/NdaPdfDocument.tsx` — `@react-pdf/renderer` rendering of the same data via the same helpers.
- `components/DownloadPdfButton.tsx` — generates the PDF **entirely in the browser** on click. `@react-pdf/renderer` and `NdaPdfDocument` are imported lazily inside the click handler so they never run during SSR.

Path alias: `@/*` → `frontend/*`.

### Key invariant

When adding or changing a Cover Page field, update `nda/format.ts` (and `nda/types.ts`) — both renderers will pick it up automatically. Editing only a component breaks preview/PDF parity.

## Testing

**Frontend:** Vitest + React Testing Library (jsdom). The PDF test (`NdaPdfDocument.test.tsx`) runs in a Node environment and asserts real `renderToBuffer` output (`%PDF-` header, non-trivial size). See `frontend/TESTING.md` for the per-file coverage map and a manual QA checklist.

**Backend:** pytest via the FastAPI `TestClient` (`backend/tests/`), covering health, the auth flow (signup, duplicate-email, signin success/failure, `/me` with valid/invalid/missing token), and the chat endpoint (`test_chat.py` monkeypatches `completion` to avoid real LLM calls, asserting the reply/data round-trip and a 502 on upstream failure). `conftest.py` points the app at a throwaway SQLite file, and each test gets a fresh schema via the startup `init_db()`.

## Gotcha

The root `.gitignore` ignores any directory named `lib/` anywhere in the tree — do not create a `lib/` folder under `frontend/` (it won't be tracked). Use `nda/` (or another name) for shared modules.
