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
| `components/NdaForm.test.tsx` | Controlled form behavior — typing updates state, radio toggles, disabled year input, min-value coercion, independent Party 1/Party 2 capture. |
| `components/NdaPreview.test.tsx` | Assembled-document rendering — placeholders vs filled values, term variants, all 11 sections, party details. |
| `app/page.test.tsx` | Form → shared state → live preview wiring end-to-end. |
| `components/NdaPdfDocument.test.tsx` | Real PDF generation via `renderToBuffer` — valid `%PDF-` output, non-trivial size, and all term variants render without throwing. |

## Manual test checklist

Run `npm run dev` and open http://localhost:3000.

**Form → preview (live updates)**
- [ ] Editing **Purpose** updates the Cover Page Purpose live.
- [ ] Picking an **Effective Date** shows it formatted (e.g. "August 1, 2026").
- [ ] Switching **MNDA term** to "Continues until terminated" disables the year box and updates the preview text.
- [ ] Switching **Term of confidentiality** to "In perpetuity" disables the year box and shows "In perpetuity."
- [ ] **Governing law** and **Jurisdiction** appear in the preview; clearing them restores the `[…]` placeholders.
- [ ] **Modifications** left blank shows "None."; text entered shows verbatim.
- [ ] Party 1 and Party 2 details render in their respective signature blocks and don't cross-contaminate.

**PDF download**
- [ ] Clicking **Download PDF** downloads `mutual-nda.pdf`.
- [ ] The button shows "Preparing PDF…" briefly, then re-enables.
- [ ] Opening the PDF shows the Cover Page values, blank signature/date lines, and all 11 Standard Terms.
- [ ] No errors in the browser console during generation.

**Layout / responsiveness**
- [ ] On a wide screen the form and preview sit side by side; the preview stays sticky while scrolling the form.
- [ ] On a narrow screen the columns stack without horizontal overflow.
