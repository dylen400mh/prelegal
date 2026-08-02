import { describe, it, expect } from "vitest";
import { coverFields, signatureRows, withPlaceholder } from "./format";
import type { DocumentData, PartyBlock } from "./types";

describe("withPlaceholder", () => {
  it("returns the trimmed value when present", () => {
    expect(withPlaceholder("  Delaware ", "Governing Law")).toBe("Delaware");
  });
  it("falls back to a bracketed placeholder when empty", () => {
    expect(withPlaceholder("   ", "Governing Law")).toBe("[Governing Law]");
  });
});

describe("coverFields", () => {
  it("maps collected fields, filling placeholders for empty values", () => {
    const data: DocumentData = {
      docType: "mutual-nda",
      coverFields: [
        { label: "Purpose", value: "Evaluating a deal." },
        { label: "Governing Law", value: "" },
      ],
      parties: [],
    };
    expect(coverFields(data)).toEqual([
      { label: "Purpose", value: "Evaluating a deal." },
      { label: "Governing Law", value: "[Governing Law]" },
    ]);
  });
});

describe("signatureRows", () => {
  it("produces six rows with signature and date left blank", () => {
    const party: PartyBlock = {
      heading: "Provider",
      company: "Acme, Inc.",
      name: "Jane Doe",
      title: "CTO",
      noticeAddress: "legal@acme.com",
    };
    const rows = signatureRows(party);
    expect(rows.map((r) => r.label)).toEqual([
      "Signature",
      "Print Name",
      "Title",
      "Company",
      "Notice Address",
      "Date",
    ]);
    expect(rows.find((r) => r.label === "Company")?.value).toBe("Acme, Inc.");
    expect(rows.find((r) => r.label === "Signature")?.value).toBe("");
  });
});
