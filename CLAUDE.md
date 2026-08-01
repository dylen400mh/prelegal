# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`prelegal` generates legal documents from a curated set of [Common Paper](https://github.com/CommonPaper) templates. The first (and currently only) implemented tool is a **Mutual NDA creator** — a Next.js frontend that assembles a Common Paper Mutual NDA from user-entered Cover Page values and lets the user download it as a PDF. The project is an early-stage prototype (see `README.md`).

Work is tracked with `PL-<n>` ticket prefixes on commits/branches.

## Development process

Every feature follows this end-to-end flow:

1. **Read the ticket.** Use the Atlassian MCP tools (`getJiraIssue`, `searchJiraIssuesUsingJql`, etc.) to pull the feature instructions and acceptance criteria from Jira (the `PL-<n>` ticket).
2. **Develop the feature** using the `feature-dev` skill and do not skip any of its 7 phases: (1) Discovery, (2) Codebase Exploration, (3) Clarifying Questions, (4) Architecture Design, (5) Implementation, (6) Quality Review, (7) Summary.
3. **Test thoroughly** with both unit tests and integration tests; run them and fix any issues before moving on.
4. **Open a PR** using the GitHub MCP tools (`create_pull_request`).

## AI design

When writing code that calls an LLM (to interpret input and populate fields in a legal document):

- Route calls through **LiteLLM** via **OpenRouter** to the **`openrouter/openai/gpt-oss-120b`** model, with **Cerebras** as the interface/inference provider. Use the `cerebras` skill for the setup and call conventions.
- Always use **structured outputs** so responses can be parsed and mapped directly onto the document's fields.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Repository layout

- `templates/` — Common Paper legal document templates as Markdown (verbatim, CC BY 4.0). Source-of-truth legal text; do not paraphrase.
- `catalog.json` — machine-readable index of the templates (name, description, filename).
- `frontend/` — the Next.js 15 (App Router) + React 19 + Tailwind v4 app.
- `backend/` — the FastAPI service (see Technical design). Not yet created.
- `scripts/` — cross-platform start/stop scripts (see Technical design). Not yet created.

## Technical design

- **Packaging:** the entire project ships as a single **Docker container**.
- **Backend:** lives in `backend/`, a **`uv`** project built on **FastAPI**.
- **Frontend:** lives in `frontend/`. Prefer **statically building the frontend and serving it from FastAPI** if that works for the app's needs; fall back to running it as a separate service only if static export is insufficient.
- **Database** should be SQLite and be created from scratch each time the Docker container is brought up, allowing for users table with sign up and sign in.
- **Scripts:** `scripts/` holds **start/stop** scripts covering **macOS, Windows, and Linux**.

## Commands

All commands run from `frontend/`:

```bash
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm run lint         # next lint
npm test             # vitest run (once)
npm run test:watch   # vitest watch mode
npx vitest run path/to/file.test.ts   # run a single test file
```

## Frontend architecture

The MNDA is composed of two parts: a **Cover Page** (user-supplied values) plus the **static Common Paper Standard Terms**. The code is organized around keeping the on-screen preview and the downloaded PDF from ever drifting apart.

- `nda/types.ts` — `MndaData`, the single data model for the whole feature, plus `DEFAULT_MNDA`. Term/confidentiality each have a mode discriminant (`expires`|`untilTerminated`, `years`|`perpetuity`).
- `nda/terms.ts` — the Standard Terms embedded verbatim as a structured `STANDARD_TERMS` array (11 sections) plus attribution. Sourced from `templates/mutual-nda.md`; keep the legal text exact.
- `nda/format.ts` — **the shared presentation layer.** `coverFields()` and `signatureRows()` turn `MndaData` into ordered label/value rows. Both the HTML preview and the PDF read from these helpers, so all display logic (date formatting, singular/plural years, `[Bracketed]` placeholder fallbacks for empty fields) lives here and only here. Change display behavior here, not in the components.
- `components/NdaForm.tsx` — controlled form; the single owner of edits via `onChange`. State lives in `app/page.tsx` (`useState<MndaData>`) and flows down to both renderers.
- `components/NdaPreview.tsx` — HTML/Tailwind rendering, consumes `coverFields`/`signatureRows`.
- `components/NdaPdfDocument.tsx` — `@react-pdf/renderer` rendering of the same data via the same helpers.
- `components/DownloadPdfButton.tsx` — generates the PDF **entirely in the browser** on click. `@react-pdf/renderer` and `NdaPdfDocument` are imported lazily inside the click handler so they never run during SSR.

Path alias: `@/*` → `frontend/*`.

### Key invariant

When adding or changing a Cover Page field, update `nda/format.ts` (and `nda/types.ts`) — both renderers will pick it up automatically. Editing only a component breaks preview/PDF parity.

## Testing

Vitest + React Testing Library (jsdom). The PDF test (`NdaPdfDocument.test.tsx`) runs in a Node environment and asserts real `renderToBuffer` output (`%PDF-` header, non-trivial size). See `frontend/TESTING.md` for the per-file coverage map and a manual QA checklist.

## Gotcha

The root `.gitignore` ignores any directory named `lib/` anywhere in the tree — do not create a `lib/` folder under `frontend/` (it won't be tracked). Use `nda/` (or another name) for shared modules.
