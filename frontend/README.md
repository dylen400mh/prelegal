# Mutual NDA Creator (frontend)

A Next.js app that turns a conversation with an AI into a downloadable
**Common Paper Mutual Non-Disclosure Agreement**.

The user chats with an assistant that asks about the cover-page details
(purpose, effective date, term, governing law, and both parties' information),
sees the assembled MNDA update live as answers are captured, and downloads it as
a PDF.

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

The assembled MNDA is a **Cover Page** (the user's values) plus the static
**Standard Terms** — exactly how Common Paper documents compose, where the
Standard Terms reference defined terms that the Cover Page fills in.

| Path | Purpose |
| --- | --- |
| `nda/types.ts` | Document data model (`MndaData`) and defaults |
| `nda/terms.ts` | Common Paper Mutual NDA Standard Terms v1.0, embedded verbatim |
| `nda/format.ts` | Shared display helpers (term text, date formatting, placeholders) |
| `nda/chat.ts` | Client for the backend `/api/chat` endpoint |
| `components/NdaChat.tsx` | The AI chat panel; captures answers into `MndaData` |
| `components/NdaPreview.tsx` | Live on-screen rendering of the document |
| `components/NdaPdfDocument.tsx` | `@react-pdf/renderer` document for the PDF |
| `components/DownloadPdfButton.tsx` | Client-side PDF generation + download |

The Standard Terms text is sourced from `../templates/mutual-nda.md`.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · @react-pdf/renderer.
PDF generation runs entirely client-side; the chat calls the FastAPI backend's
`/api/chat` endpoint (see `../backend`).

## Attribution

Document content is the Common Paper Mutual Non-Disclosure Agreement
(Version 1.0), free to use under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
