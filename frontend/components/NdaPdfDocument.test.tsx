// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { NdaPdfDocument } from "./NdaPdfDocument";
import { DEFAULT_MNDA, type MndaData } from "@/nda/types";

const make = (overrides: Partial<MndaData> = {}): MndaData => ({
  ...DEFAULT_MNDA,
  ...overrides,
});

const isPdf = (buf: Uint8Array) =>
  Buffer.from(buf.subarray(0, 5)).toString("latin1") === "%PDF-";

describe("NdaPdfDocument (real PDF generation)", () => {
  it("produces a valid, non-trivial PDF from a fully filled form", async () => {
    const buffer = await renderToBuffer(
      <NdaPdfDocument
        data={make({
          effectiveDate: "2026-08-01",
          governingLaw: "Delaware",
          jurisdiction: "New Castle, DE",
          modifications: "None.",
          party1: {
            company: "Acme, Inc.",
            name: "Jane Doe",
            title: "CEO",
            noticeAddress: "legal@acme.com",
          },
          party2: {
            company: "Globex LLC",
            name: "John Roe",
            title: "COO",
            noticeAddress: "legal@globex.com",
          },
        })}
      />,
    );

    expect(isPdf(buffer)).toBe(true);
    // A full multi-section legal document should be several KB.
    expect(buffer.length).toBeGreaterThan(3000);
  });

  it("renders even with only default values (no fields filled)", async () => {
    const buffer = await renderToBuffer(<NdaPdfDocument data={make()} />);
    expect(isPdf(buffer)).toBe(true);
  });

  it("renders the perpetuity + until-terminated variants without throwing", async () => {
    const buffer = await renderToBuffer(
      <NdaPdfDocument
        data={make({
          mndaTermMode: "untilTerminated",
          confidentialityMode: "perpetuity",
        })}
      />,
    );
    expect(isPdf(buffer)).toBe(true);
  });
});
