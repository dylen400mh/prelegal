// Presentation helpers shared by the HTML preview and the PDF document, so the
// two renderings never drift apart. The chat supplies already-formatted values;
// these helpers only fill in bracketed placeholders for anything still empty.

import type { DocumentData, PartyBlock } from "./types";

/** Non-empty trimmed value, or the bracketed placeholder. */
export function withPlaceholder(value: string, placeholder: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : `[${placeholder}]`;
}

export interface LabelledValue {
  label: string;
  value: string;
}

/** The collected Cover Page / Key Terms rows, in the order gathered. */
export function coverFields(data: DocumentData): LabelledValue[] {
  return data.coverFields.map((f) => ({
    label: f.label,
    value: withPlaceholder(f.value, f.label),
  }));
}

/**
 * A party's signature-block rows, in order. Signature and Date are intentionally
 * blank — they are signed by hand after the document is downloaded.
 */
export function signatureRows(party: PartyBlock): LabelledValue[] {
  return [
    { label: "Signature", value: "" },
    { label: "Print Name", value: party.name },
    { label: "Title", value: party.title },
    { label: "Company", value: party.company },
    { label: "Notice Address", value: party.noticeAddress },
    { label: "Date", value: "" },
  ];
}
