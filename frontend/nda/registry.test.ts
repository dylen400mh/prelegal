import { describe, it, expect } from "vitest";
import { DOCUMENT_TYPES, getDocumentType } from "./registry";

describe("document registry", () => {
  it("contains all 11 supported document types", () => {
    expect(DOCUMENT_TYPES).toHaveLength(11);
    const ids = DOCUMENT_TYPES.map((d) => d.id);
    expect(ids).toContain("mutual-nda");
    expect(ids).toContain("cloud-service-agreement");
    // The MNDA cover page is not a standalone document.
    expect(ids).not.toContain("mutual-nda-coverpage");
  });

  it("gives every document metadata and verbatim terms", () => {
    for (const doc of DOCUMENT_TYPES) {
      expect(doc.name).toBeTruthy();
      expect(doc.description).toBeTruthy();
      expect(doc.terms.length).toBeGreaterThan(0);
      expect(doc.attribution).toMatch(/Common Paper/);
      // Every section has a heading and at least one block of text.
      for (const section of doc.terms) {
        expect(section.heading).toBeTruthy();
        expect(section.blocks.length).toBeGreaterThan(0);
      }
    }
  });

  it("embeds the MNDA standard terms verbatim", () => {
    const mnda = getDocumentType("mutual-nda");
    expect(mnda?.name).toBe("Mutual Non-Disclosure Agreement");
    const intro = mnda?.terms[0].blocks.join(" ") ?? "";
    expect(intro).toContain("Confidential Information");
  });

  it("returns undefined for an unknown id", () => {
    expect(getDocumentType("nope")).toBeUndefined();
  });
});
