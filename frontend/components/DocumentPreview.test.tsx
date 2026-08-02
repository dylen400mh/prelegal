import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DocumentPreview from "./DocumentPreview";
import { EMPTY_DOCUMENT, type DocumentData } from "@/nda/types";

describe("DocumentPreview", () => {
  it("prompts to pick a document before one is chosen", () => {
    render(<DocumentPreview data={EMPTY_DOCUMENT} />);
    expect(screen.getByText(/your document will appear here/i)).toBeInTheDocument();
  });

  it("renders the chosen document's title, fields, parties, and verbatim terms", () => {
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
    render(<DocumentPreview data={data} />);

    expect(
      screen.getByRole("heading", { name: "Mutual Non-Disclosure Agreement", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Evaluating a deal.")).toBeInTheDocument();
    expect(screen.getByText("Party 1")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    // Verbatim standard-terms text is present.
    expect(screen.getAllByText(/Confidential Information/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Common Paper Mutual Non-Disclosure Agreement/)).toBeInTheDocument();
  });

  it("fills a bracketed placeholder for an empty field value", () => {
    const data: DocumentData = {
      docType: "mutual-nda",
      coverFields: [{ label: "Governing Law", value: "" }],
      parties: [],
    };
    render(<DocumentPreview data={data} />);
    expect(screen.getByText("[Governing Law]")).toBeInTheDocument();
  });
});
