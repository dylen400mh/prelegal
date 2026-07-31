// Data model for the Mutual NDA creator (PL-3).
//
// The assembled MNDA is composed of a Cover Page (these user-supplied values)
// plus the static Common Paper Standard Terms (see ./terms.ts). The Standard
// Terms reference defined terms — Purpose, Effective Date, MNDA Term, Term of
// Confidentiality, Governing Law, Jurisdiction — that the Cover Page fills in.

export interface Party {
  company: string;
  /** Print name of the signer. */
  name: string;
  title: string;
  /** Email or postal address used for notices. */
  noticeAddress: string;
}

export type MndaTermMode = "expires" | "untilTerminated";
export type ConfidentialityMode = "years" | "perpetuity";

export interface MndaData {
  purpose: string;
  /** Effective date as an ISO `yyyy-mm-dd` string (empty until chosen). */
  effectiveDate: string;
  mndaTermMode: MndaTermMode;
  mndaTermYears: number;
  confidentialityMode: ConfidentialityMode;
  confidentialityYears: number;
  /** US state whose law governs the MNDA. */
  governingLaw: string;
  /** City/county and state for jurisdiction, e.g. "New Castle, DE". */
  jurisdiction: string;
  /** Optional free-text modifications to the Standard Terms. */
  modifications: string;
  party1: Party;
  party2: Party;
}

const emptyParty = (): Party => ({
  company: "",
  name: "",
  title: "",
  noticeAddress: "",
});

/** Sensible starting values matching the Common Paper cover-page defaults. */
export const DEFAULT_MNDA: MndaData = {
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermMode: "expires",
  mndaTermYears: 1,
  confidentialityMode: "years",
  confidentialityYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: emptyParty(),
  party2: emptyParty(),
};
