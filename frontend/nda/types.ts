// Data model for the legal-document creator (PL-6).
//
// The app supports every Common Paper template in the registry (see
// ./registry.ts). A document is assembled from user-supplied Cover Page /
// Key Terms values (gathered by the AI chat) plus the verbatim Standard Terms
// for the chosen document type. The AI only chooses the document type and
// collects field values — it never writes the legal text.

/** A signatory block. `heading` is the party's role, e.g. "Provider". */
export interface PartyBlock {
  heading: string;
  company: string;
  /** Print name of the signer. */
  name: string;
  title: string;
  /** Email or postal address used for notices. */
  noticeAddress: string;
}

/** A collected Cover Page / Key Terms field. */
export interface CoverField {
  label: string;
  value: string;
}

export interface DocumentData {
  /** Registry id of the chosen document type, or "" before one is chosen. */
  docType: string;
  coverFields: CoverField[];
  parties: PartyBlock[];
}

export const EMPTY_DOCUMENT: DocumentData = {
  docType: "",
  coverFields: [],
  parties: [],
};
