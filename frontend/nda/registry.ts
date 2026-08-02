// Typed access to the generated document registry (see scripts/build-registry.mjs).
// Each entry carries the document's metadata, its fillable fields, and the
// verbatim Standard Terms embedded from templates/.

import registryData from "./registry.json";

export interface TermsSection {
  n: number;
  heading: string;
  blocks: string[];
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  terms: TermsSection[];
  attribution: string;
}

export const DOCUMENT_TYPES: DocumentType[] = registryData as DocumentType[];

export function getDocumentType(id: string): DocumentType | undefined {
  return DOCUMENT_TYPES.find((d) => d.id === id);
}
