// Presentation helpers shared by the HTML preview and the PDF document, so the
// two renderings never drift apart. Each helper falls back to a bracketed
// placeholder (e.g. "[Effective Date]") when a value has not been filled in yet.

import type { MndaData, Party } from "./types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Non-empty trimmed value, or the bracketed placeholder. */
export function withPlaceholder(value: string, placeholder: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : `[${placeholder}]`;
}

/** Format an ISO `yyyy-mm-dd` date as e.g. "January 2, 2026". */
export function formatEffectiveDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return "[Effective Date]";
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11) return "[Effective Date]";
  // Reject impossible calendar days (e.g. "2026-02-31") by round-tripping
  // through Date — a rolled-over date won't match the parts we put in.
  const date = new Date(year, monthIndex, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return "[Effective Date]";
  }
  return `${MONTHS[monthIndex]} ${day}, ${year}`;
}

function pluralYears(years: number): string {
  return `${years} ${years === 1 ? "year" : "years"}`;
}

/** Human-readable "MNDA Term" line for the Cover Page. */
export function mndaTermText(data: MndaData): string {
  if (data.mndaTermMode === "untilTerminated") {
    return "Continues until terminated in accordance with the terms of the MNDA.";
  }
  return `Expires ${pluralYears(data.mndaTermYears)} from the Effective Date.`;
}

/** Human-readable "Term of Confidentiality" line for the Cover Page. */
export function confidentialityText(data: MndaData): string {
  if (data.confidentialityMode === "perpetuity") {
    return "In perpetuity.";
  }
  return `${pluralYears(
    data.confidentialityYears,
  )} from the Effective Date, but in the case of trade secrets until the Confidential Information is no longer considered a trade secret under applicable laws.`;
}

export const governingLawText = (data: MndaData): string =>
  withPlaceholder(data.governingLaw, "Governing Law");

export const jurisdictionText = (data: MndaData): string =>
  withPlaceholder(data.jurisdiction, "Jurisdiction");

export const purposeText = (data: MndaData): string =>
  withPlaceholder(data.purpose, "Purpose");

export const modificationsText = (data: MndaData): string => {
  const trimmed = data.modifications.trim();
  return trimmed.length > 0 ? trimmed : "None.";
};

export interface LabelledValue {
  label: string;
  value: string;
}

/**
 * The Cover Page fields, in order — the single source of truth for both the
 * on-screen preview and the PDF, so the two renderings cannot drift apart.
 */
export function coverFields(data: MndaData): LabelledValue[] {
  return [
    { label: "Purpose", value: purposeText(data) },
    { label: "Effective Date", value: formatEffectiveDate(data.effectiveDate) },
    { label: "MNDA Term", value: mndaTermText(data) },
    { label: "Term of Confidentiality", value: confidentialityText(data) },
    { label: "Governing Law", value: governingLawText(data) },
    { label: "Jurisdiction", value: jurisdictionText(data) },
    { label: "Modifications", value: modificationsText(data) },
  ];
}

/**
 * A party's signature-block rows, in order. Signature and Date are intentionally
 * blank — they are signed by hand after the document is downloaded.
 */
export function signatureRows(party: Party): LabelledValue[] {
  return [
    { label: "Signature", value: "" },
    { label: "Print Name", value: party.name },
    { label: "Title", value: party.title },
    { label: "Company", value: party.company },
    { label: "Notice Address", value: party.noticeAddress },
    { label: "Date", value: "" },
  ];
}
