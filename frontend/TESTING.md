# Testing

## Automated tests

```bash
cd frontend
npm test          # run once
npm run test:watch
```

Stack: **Vitest** + **React Testing Library** (jsdom), with the PDF-generation
test running in a Node environment.

| Test file | Covers |
| --- | --- |
| `nda/format.test.ts` | Every branch of the display helpers — date formatting (valid/invalid/out-of-range), singular/plural year text, perpetuity & until-terminated variants, and placeholder fallbacks. |
| `nda/terms.test.ts` | Standard Terms integrity — all 11 sections present & ordered, no leftover HTML markup, defined terms referenced, disclaimer preserved verbatim, attribution intact, sane defaults. |
| `components/NdaChat.test.tsx` | Chat panel behavior (`fetch` mocked) — greeting shown, send flow renders user + assistant messages, returned `MndaData` pushed via `onChange`, request carries the current data + message, error path surfaces an alert and restores the input. |
| `components/NdaPreview.test.tsx` | Assembled-document rendering — placeholders vs filled values, term variants, all 11 sections, party details. |
| `app/page.test.tsx` | Chat (mocked `sendChat`) → shared state → live preview wiring end-to-end. |
| `components/NdaPdfDocument.test.tsx` | Real PDF generation via `renderToBuffer` — valid `%PDF-` output, non-trivial size, and all term variants render without throwing. |

## Manual test checklist

The chat calls the backend at `/api/chat`, so run the **full container**
(`./scripts/start.sh`, needs `OPENROUTER_API_KEY`) and open
http://localhost:8000. (`npm run dev` on :3000 serves the UI but can't reach the
backend without a proxy/CORS.)

**Chat → preview (live updates)**
- [ ] The chat opens with the assistant greeting and the preview shows `[…]` placeholders.
- [ ] Describing the parties (company, signer name, title, notice address) fills both signature blocks correctly, without cross-contaminating Party 1/Party 2.
- [ ] Giving an **effective date** shows it formatted (e.g. "September 1, 2026").
- [ ] Asking for the MNDA to **continue until terminated** / confidentiality **in perpetuity** updates the preview text accordingly.
- [ ] Stating **governing law** and **jurisdiction** fills them in the preview.
- [ ] The assistant asks natural follow-up questions and only fills fields the user actually provided.
- [ ] A backend/LLM failure surfaces an inline error and keeps the typed message.

**PDF download**
- [ ] Clicking **Download PDF** downloads `mutual-nda.pdf`.
- [ ] The button shows "Preparing PDF…" briefly, then re-enables.
- [ ] Opening the PDF shows the Cover Page values, blank signature/date lines, and all 11 Standard Terms.
- [ ] No errors in the browser console during generation.

**Layout / responsiveness**
- [ ] On a wide screen the chat and preview sit side by side; the preview stays sticky while scrolling.
- [ ] On a narrow screen the columns stack without horizontal overflow.
