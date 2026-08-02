import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import { type DocumentData } from "@/nda/types";

// The chat calls the backend via sendChat; mock it so the page test stays
// self-contained and asserts the chat -> shared state -> preview wiring.
const sendChat = vi.hoisted(() => vi.fn());
vi.mock("@/nda/chat", () => ({ sendChat }));

describe("Home page", () => {
  beforeEach(() => {
    sendChat.mockReset();
  });

  it("renders the chat, the preview placeholder, and a disabled download", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "Legal Document Creator", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/I can help you create a legal document/),
    ).toBeInTheDocument();
    expect(screen.getByText(/your document will appear here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeDisabled();
  });

  it("flows a chat-selected document into the preview", async () => {
    const updated: DocumentData = {
      docType: "mutual-nda",
      coverFields: [{ label: "Governing Law", value: "Delaware" }],
      parties: [],
    };
    sendChat.mockResolvedValue({ reply: "Noted.", data: updated });
    const user = userEvent.setup();

    render(<Home />);

    await user.type(screen.getByLabelText("Message"), "NDA governed by Delaware");
    await user.click(screen.getByRole("button", { name: "Send" }));

    // The chosen document's title and the collected value appear in the preview.
    expect(
      await screen.findByRole("heading", {
        name: "Mutual Non-Disclosure Agreement",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Delaware")).toBeInTheDocument();
    // Download is enabled once a document type is set.
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  });
});
