import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NdaPreview from "./NdaPreview";
import { DEFAULT_MNDA, type MndaData } from "@/nda/types";
import { STANDARD_TERMS } from "@/nda/terms";

const make = (overrides: Partial<MndaData> = {}): MndaData => ({
  ...DEFAULT_MNDA,
  ...overrides,
});

describe("NdaPreview", () => {
  it("renders the document title and cover page", () => {
    render(<NdaPreview data={make()} />);
    expect(
      screen.getByRole("heading", { name: /Mutual Non-Disclosure Agreement/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cover Page")).toBeInTheDocument();
  });

  it("shows placeholders for un-filled fields", () => {
    render(<NdaPreview data={make({ governingLaw: "", jurisdiction: "", effectiveDate: "" })} />);
    expect(screen.getByText("[Governing Law]")).toBeInTheDocument();
    expect(screen.getByText("[Jurisdiction]")).toBeInTheDocument();
    expect(screen.getByText("[Effective Date]")).toBeInTheDocument();
  });

  it("shows filled-in cover-page values", () => {
    render(
      <NdaPreview
        data={make({
          governingLaw: "Delaware",
          jurisdiction: "New Castle, DE",
          effectiveDate: "2026-08-01",
        })}
      />,
    );
    expect(screen.getByText("Delaware")).toBeInTheDocument();
    expect(screen.getByText("New Castle, DE")).toBeInTheDocument();
    expect(screen.getByText("August 1, 2026")).toBeInTheDocument();
  });

  it("reflects the perpetuity confidentiality option", () => {
    render(<NdaPreview data={make({ confidentialityMode: "perpetuity" })} />);
    expect(screen.getByText("In perpetuity.")).toBeInTheDocument();
  });

  it("reflects the until-terminated MNDA term option", () => {
    render(<NdaPreview data={make({ mndaTermMode: "untilTerminated" })} />);
    expect(
      screen.getByText(/Continues until terminated in accordance/),
    ).toBeInTheDocument();
  });

  it("defaults modifications to 'None.'", () => {
    render(<NdaPreview data={make({ modifications: "" })} />);
    expect(screen.getByText("None.")).toBeInTheDocument();
  });

  it("renders all 11 Standard Terms sections", () => {
    render(<NdaPreview data={make()} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(STANDARD_TERMS.length);
    expect(screen.getByText(/1\. Introduction\./)).toBeInTheDocument();
    expect(screen.getByText(/11\. General\./)).toBeInTheDocument();
  });

  it("renders each party's captured details", () => {
    render(
      <NdaPreview
        data={make({
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
    expect(screen.getByText("Acme, Inc.")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Globex LLC")).toBeInTheDocument();
    expect(screen.getByText("legal@globex.com")).toBeInTheDocument();
  });
});
