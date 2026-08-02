// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { DocumentPdfDocument } from "./DocumentPdfDocument";
import { DOCUMENT_TYPES } from "@/nda/registry";
import { type DocumentData } from "@/nda/types";

describe("DocumentPdfDocument", () => {
  it("renders a real PDF for a populated document", async () => {
    const data: DocumentData = {
      docType: "mutual-nda",
      coverFields: [{ label: "Purpose", value: "Evaluating a deal." }],
      parties: [
        {
          heading: "Party 1",
          company: "Acme, Inc.",
          name: "Jane Doe",
          title: "CTO",
          noticeAddress: "legal@acme.com",
        },
      ],
    };
    const buffer = await renderToBuffer(<DocumentPdfDocument data={data} />);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(2000);
  });

  it("renders every supported document type without throwing", async () => {
    for (const doc of DOCUMENT_TYPES) {
      const data: DocumentData = { docType: doc.id, coverFields: [], parties: [] };
      const buffer = await renderToBuffer(<DocumentPdfDocument data={data} />);
      expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    }
  });

  it("renders a placeholder PDF when no document is selected", async () => {
    const data: DocumentData = { docType: "", coverFields: [], parties: [] };
    const buffer = await renderToBuffer(<DocumentPdfDocument data={data} />);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
