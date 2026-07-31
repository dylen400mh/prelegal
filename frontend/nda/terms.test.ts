import { describe, it, expect } from "vitest";
import {
  STANDARD_TERMS,
  STANDARD_TERMS_ATTRIBUTION,
  type StandardTermSection,
} from "./terms";
import { DEFAULT_MNDA } from "./types";

describe("STANDARD_TERMS integrity", () => {
  it("contains all 11 Common Paper sections", () => {
    expect(STANDARD_TERMS).toHaveLength(11);
  });

  it("is numbered 1..11 in order with no gaps", () => {
    expect(STANDARD_TERMS.map((s) => s.n)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });

  it("has the expected headings", () => {
    const headings = STANDARD_TERMS.map((s) => s.heading);
    expect(headings).toContain("Introduction");
    expect(headings).toContain("Term and Termination");
    expect(headings).toContain("Governing Law and Jurisdiction");
    expect(headings).toContain("General");
  });

  it("gives every section a non-empty heading and body", () => {
    for (const section of STANDARD_TERMS) {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("carries no leftover HTML markup from the source template", () => {
    for (const section of STANDARD_TERMS) {
      expect(section.text).not.toContain("<span");
      expect(section.text).not.toContain("</span>");
      expect(section.text).not.toContain("coverpage_link");
    }
  });

  it("references the defined terms the Cover Page fills in", () => {
    const all = STANDARD_TERMS.map((s) => s.text).join(" ");
    for (const term of [
      "Purpose",
      "Effective Date",
      "MNDA Term",
      "Term of Confidentiality",
      "Governing Law",
      "Jurisdiction",
    ]) {
      expect(all).toContain(term);
    }
  });

  it("preserves the all-caps disclaimer verbatim", () => {
    const disclaimer = STANDARD_TERMS.find((s) => s.heading === "Disclaimer");
    expect(disclaimer?.text).toContain('ALL CONFIDENTIAL INFORMATION IS PROVIDED');
    expect(disclaimer?.text).toContain("MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE");
  });

  it("keeps the Common Paper CC BY 4.0 attribution", () => {
    expect(STANDARD_TERMS_ATTRIBUTION).toContain("Common Paper");
    expect(STANDARD_TERMS_ATTRIBUTION).toContain("CC BY 4.0");
  });

  it("has a shape that matches the StandardTermSection type", () => {
    const sample: StandardTermSection = STANDARD_TERMS[0];
    expect(typeof sample.n).toBe("number");
    expect(typeof sample.heading).toBe("string");
    expect(typeof sample.text).toBe("string");
  });
});

describe("DEFAULT_MNDA", () => {
  it("starts on the Common Paper cover-page defaults", () => {
    expect(DEFAULT_MNDA.mndaTermMode).toBe("expires");
    expect(DEFAULT_MNDA.mndaTermYears).toBe(1);
    expect(DEFAULT_MNDA.confidentialityMode).toBe("years");
    expect(DEFAULT_MNDA.confidentialityYears).toBe(1);
    expect(DEFAULT_MNDA.purpose).toMatch(/business relationship/i);
  });

  it("starts with empty, independent party objects", () => {
    expect(DEFAULT_MNDA.party1).not.toBe(DEFAULT_MNDA.party2);
    expect(DEFAULT_MNDA.party1.company).toBe("");
    expect(DEFAULT_MNDA.party2.noticeAddress).toBe("");
  });
});
