import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadPdfButton from "./DownloadPdfButton";
import { EMPTY_DOCUMENT, type DocumentData } from "@/nda/types";

const DOC: DocumentData = { docType: "mutual-nda", coverFields: [], parties: [] };

// Control what the lazily-imported PDF renderer does per-test.
const toBlob = vi.fn();
vi.mock("@react-pdf/renderer", () => ({
  pdf: () => ({ toBlob }),
  // DocumentPdfDocument (imported alongside) needs these at module load.
  StyleSheet: { create: (styles: unknown) => styles },
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
}));

describe("DownloadPdfButton", () => {
  beforeEach(() => {
    toBlob.mockReset();
    // jsdom lacks these object-URL APIs.
    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is disabled until a document type is chosen", () => {
    render(<DownloadPdfButton data={EMPTY_DOCUMENT} />);
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeDisabled();
  });

  it("downloads a generated PDF on click", async () => {
    toBlob.mockResolvedValue(new Blob(["%PDF-"], { type: "application/pdf" }));
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");
    const user = userEvent.setup();

    render(<DownloadPdfButton data={DOC} />);
    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    // The download runs through async dynamic imports, so wait for it to land.
    await waitFor(() => expect(clickSpy).toHaveBeenCalledOnce());
    expect(toBlob).toHaveBeenCalledOnce();
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledOnce();
    // No error surfaced on the happy path.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error message when generation fails, instead of failing silently", async () => {
    toBlob.mockRejectedValue(new Error("render exploded"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<DownloadPdfButton data={DOC} />);
    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn't be generated/i);
    // Button recovers so the user can retry.
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  });
});
