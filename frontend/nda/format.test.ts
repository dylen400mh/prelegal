import { describe, it, expect } from "vitest";
import {
  confidentialityText,
  formatEffectiveDate,
  governingLawText,
  jurisdictionText,
  modificationsText,
  mndaTermText,
  purposeText,
  withPlaceholder,
} from "./format";
import { DEFAULT_MNDA, type MndaData } from "./types";

const make = (overrides: Partial<MndaData> = {}): MndaData => ({
  ...DEFAULT_MNDA,
  ...overrides,
});

describe("withPlaceholder", () => {
  it("returns the trimmed value when present", () => {
    expect(withPlaceholder("  Delaware  ", "Governing Law")).toBe("Delaware");
  });

  it("falls back to a bracketed placeholder when empty", () => {
    expect(withPlaceholder("", "Governing Law")).toBe("[Governing Law]");
  });

  it("treats whitespace-only input as empty", () => {
    expect(withPlaceholder("   ", "Jurisdiction")).toBe("[Jurisdiction]");
  });
});

describe("formatEffectiveDate", () => {
  it("formats a valid ISO date as a long-form US date", () => {
    expect(formatEffectiveDate("2026-08-01")).toBe("August 1, 2026");
  });

  it("strips leading zeros from the day", () => {
    expect(formatEffectiveDate("2026-01-09")).toBe("January 9, 2026");
  });

  it("handles the last day/month of the year", () => {
    expect(formatEffectiveDate("2025-12-31")).toBe("December 31, 2025");
  });

  it("returns a placeholder for an empty string", () => {
    expect(formatEffectiveDate("")).toBe("[Effective Date]");
  });

  it("returns a placeholder for a non-ISO string", () => {
    expect(formatEffectiveDate("08/01/2026")).toBe("[Effective Date]");
  });

  it("rejects an out-of-range month", () => {
    expect(formatEffectiveDate("2026-13-01")).toBe("[Effective Date]");
  });

  it("rejects month zero", () => {
    expect(formatEffectiveDate("2026-00-10")).toBe("[Effective Date]");
  });
});

describe("mndaTermText", () => {
  it("describes an expiry in whole years (plural)", () => {
    expect(mndaTermText(make({ mndaTermMode: "expires", mndaTermYears: 3 }))).toBe(
      "Expires 3 years from the Effective Date.",
    );
  });

  it("uses the singular for a one-year term", () => {
    expect(mndaTermText(make({ mndaTermMode: "expires", mndaTermYears: 1 }))).toBe(
      "Expires 1 year from the Effective Date.",
    );
  });

  it("describes an until-terminated term", () => {
    expect(mndaTermText(make({ mndaTermMode: "untilTerminated" }))).toBe(
      "Continues until terminated in accordance with the terms of the MNDA.",
    );
  });
});

describe("confidentialityText", () => {
  it("describes a multi-year confidentiality period", () => {
    expect(
      confidentialityText(make({ confidentialityMode: "years", confidentialityYears: 5 })),
    ).toContain("5 years from the Effective Date");
  });

  it("uses the singular for one year and mentions trade secrets", () => {
    const text = confidentialityText(
      make({ confidentialityMode: "years", confidentialityYears: 1 }),
    );
    expect(text).toContain("1 year from the Effective Date");
    expect(text).toContain("trade secret");
  });

  it("describes perpetuity", () => {
    expect(confidentialityText(make({ confidentialityMode: "perpetuity" }))).toBe(
      "In perpetuity.",
    );
  });
});

describe("simple placeholder-backed fields", () => {
  it("shows the governing law or its placeholder", () => {
    expect(governingLawText(make({ governingLaw: "Delaware" }))).toBe("Delaware");
    expect(governingLawText(make({ governingLaw: "" }))).toBe("[Governing Law]");
  });

  it("shows the jurisdiction or its placeholder", () => {
    expect(jurisdictionText(make({ jurisdiction: "New Castle, DE" }))).toBe(
      "New Castle, DE",
    );
    expect(jurisdictionText(make({ jurisdiction: "" }))).toBe("[Jurisdiction]");
  });

  it("shows the purpose or its placeholder", () => {
    expect(purposeText(make({ purpose: "Evaluating a deal." }))).toBe(
      "Evaluating a deal.",
    );
    expect(purposeText(make({ purpose: "  " }))).toBe("[Purpose]");
  });
});

describe("modificationsText", () => {
  it("returns the entered modifications", () => {
    expect(modificationsText(make({ modifications: "Section 9 amended." }))).toBe(
      "Section 9 amended.",
    );
  });

  it("defaults to 'None.' when blank", () => {
    expect(modificationsText(make({ modifications: "" }))).toBe("None.");
    expect(modificationsText(make({ modifications: "   " }))).toBe("None.");
  });
});
