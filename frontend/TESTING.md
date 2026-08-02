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
| `nda/registry.test.ts` | Registry integrity — all 11 document types present, each has metadata/fields/verbatim terms/attribution, MNDA terms embedded verbatim, unknown id returns undefined. |
| `nda/format.test.ts` | Display helpers — cover-field mapping, placeholder fallbacks, and signature rows. |
| `components/DocumentChat.test.tsx` | Chat panel behavior (`fetch` mocked) — greeting shown, send flow renders user + assistant messages, returned `DocumentData` pushed via `onChange`, request payload, error path surfaces an alert and restores the input. |
| `components/DocumentPreview.test.tsx` | Assembled-document rendering — placeholder before a doc is chosen; title, fields, party blocks, and verbatim terms once chosen; bracketed placeholders for empty fields. |
| `app/page.test.tsx` | Chat (mocked `sendChat`) → shared state → live preview wiring; download disabled until a doc type is set. |
| `components/DocumentPdfDocument.test.tsx` | Real PDF generation via `renderToBuffer` — valid `%PDF-` output for a populated doc and for **every** registry document type, plus the empty-state placeholder PDF. |
| `components/DownloadPdfButton.test.tsx` | Download disabled until a doc type is set; happy-path download; error surfaced on failure. |

## Manual test checklist

The chat calls the backend at `/api/chat`, so run the **full container**
(`./scripts/start.sh`, needs `OPENROUTER_API_KEY`) and open
http://localhost:8000. (`npm run dev` on :3000 serves the UI but can't reach the
backend without a proxy/CORS.)

**Chat → document selection**
- [ ] The chat opens with the assistant greeting and the preview shows a "pick a document" placeholder; Download PDF is disabled.
- [ ] Asking for a supported document (e.g. "a Cloud Service Agreement") selects it — the preview title and Standard Terms switch to that document.
- [ ] Asking for an **unsupported** document (e.g. "an employment contract") is declined, with the closest supported document offered instead; no document is selected.

**Chat → preview (live updates)**
- [ ] Describing the parties (role, company, signer name, title, notice address) fills the signature blocks with the right role headings (e.g. Provider/Customer), without cross-contamination.
- [ ] Stated fields (dates, governing law, subscription period, etc.) appear under Key Terms in the preview.
- [ ] The assistant asks natural follow-up questions and only fills fields the user actually provided.
- [ ] A backend/LLM failure surfaces an inline error and keeps the typed message.

**PDF download**
- [ ] Once a document type is chosen, Download PDF enables and downloads `<doc-type>.pdf`.
- [ ] The button shows "Preparing PDF…" briefly, then re-enables.
- [ ] Opening the PDF shows the Key Terms, blank signature/date lines, and the document's verbatim Standard Terms.
- [ ] No errors in the browser console during generation.

**Layout / responsiveness**
- [ ] On a wide screen the chat and preview sit side by side; the preview stays sticky while scrolling.
- [ ] On a narrow screen the columns stack without horizontal overflow.
