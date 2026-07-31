# Mutual NDA Creator (frontend)

A Next.js prototype for [PL-3](https://dylenbelanger2004.atlassian.net/browse/PL-3):
a web app that turns a short form into a downloadable **Common Paper Mutual
Non-Disclosure Agreement**.

The user fills in the cover-page details (purpose, effective date, term,
governing law, and both parties' information), sees the assembled MNDA update
live, and downloads it as a PDF.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

The assembled MNDA is a **Cover Page** (the user's values) plus the static
**Standard Terms** — exactly how Common Paper documents compose, where the
Standard Terms reference defined terms that the Cover Page fills in.

| Path | Purpose |
| --- | --- |
| `nda/types.ts` | Form data model (`MndaData`) and defaults |
| `nda/terms.ts` | Common Paper Mutual NDA Standard Terms v1.0, embedded verbatim |
| `nda/format.ts` | Shared display helpers (term text, date formatting, placeholders) |
| `components/NdaForm.tsx` | The input form |
| `components/NdaPreview.tsx` | Live on-screen rendering of the document |
| `components/NdaPdfDocument.tsx` | `@react-pdf/renderer` document for the PDF |
| `components/DownloadPdfButton.tsx` | Client-side PDF generation + download |

The Standard Terms text is sourced from `../templates/mutual-nda.md`.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · @react-pdf/renderer.
PDF generation runs entirely client-side — no server or backend required.

## Attribution

Document content is the Common Paper Mutual Non-Disclosure Agreement
(Version 1.0), free to use under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
