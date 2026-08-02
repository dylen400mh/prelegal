# Legal Document Creator (frontend)

A Next.js app that turns a conversation with an AI into a downloadable
**Common Paper legal document** — any of the 11 supported templates (Mutual NDA,
Cloud Service Agreement, Pilot Agreement, DPA, and more).

The user chats with an assistant that works out which document they need
(declining unsupported types and offering the closest one), asks about the
document's fields, sees the assembled document update live as answers are
captured, and downloads it as a PDF.

## Getting started

The chat calls the backend at `/api/chat`, so run the full app (frontend +
backend) as a single container from the repo root:

```bash
./scripts/start.sh        # http://localhost:8000  (needs OPENROUTER_API_KEY)
```

For frontend-only UI work:

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000 (chat can't reach the backend)
```

## How it works

An assembled document is the **fields** the user supplies (gathered by the chat)
plus the static **Standard Terms** for the chosen type. The verbatim terms come
from the generated document registry (`nda/registry.json`), so the legal text
stays exact and the AI never writes it.

| Path | Purpose |
| --- | --- |
| `nda/types.ts` | Document data model (`DocumentData`, `PartyBlock`) |
| `nda/registry.ts` | Typed access to the generated `registry.json` (types, fields, terms) |
| `nda/registry.json` | Generated registry — do not hand-edit (see `../scripts/build-registry.mjs`) |
| `nda/format.ts` | Shared display helpers (cover fields, signature rows, placeholders) |
| `nda/chat.ts` | Client for the backend `/api/chat` endpoint |
| `components/DocumentChat.tsx` | The AI chat panel; captures answers into `DocumentData` |
| `components/DocumentPreview.tsx` | Live on-screen rendering of the document |
| `components/DocumentPdfDocument.tsx` | `@react-pdf/renderer` document for the PDF |
| `components/DownloadPdfButton.tsx` | Client-side PDF generation + download |

The Standard Terms are sourced from `../templates/*.md` via the registry build
script.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · @react-pdf/renderer.
PDF generation runs entirely client-side; the chat calls the FastAPI backend's
`/api/chat` endpoint (see `../backend`).

## Attribution

Document content comes from the Common Paper templates, free to use under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each document's
per-template attribution is carried in the registry (`nda/registry.json`) and
shown in the assembled document.
