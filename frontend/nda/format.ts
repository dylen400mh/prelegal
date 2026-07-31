// Presentation helpers shared by the HTML preview and the PDF document, so the
// two renderings never drift apart. Each helper falls back to a bracketed
// placeholder (e.g. "[Effective Date]") when a value has not been filled in yet.

import type { MndaData } from "./types";

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
  const [, y, m, d] = match;
  const monthIndex = Number(m) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "[Effective Date]";
  return `${MONTHS[monthIndex]} ${Number(d)}, ${y}`;
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
