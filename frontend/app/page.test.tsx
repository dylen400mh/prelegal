import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import { DEFAULT_MNDA, type MndaData } from "@/nda/types";

// The chat calls the backend via sendChat; mock it so the page test stays
// self-contained and asserts the chat -> shared state -> preview wiring.
const sendChat = vi.hoisted(() => vi.fn());
vi.mock("@/nda/chat", () => ({ sendChat }));

/**
 * End-to-end wiring of the page: the chat drives the shared state, and the
 * preview re-renders from it. (The PDF library is only imported when the
 * Download button is clicked, so rendering the page never loads it.)
 */
describe("Home page", () => {
  beforeEach(() => {
    sendChat.mockReset();
  });

  it("renders the chat and the live preview together", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "Mutual NDA Creator", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/I'll help you put together a Mutual NDA/),
    ).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
  });

  it("flows chat-extracted data into the preview", async () => {
    const updated: MndaData = { ...DEFAULT_MNDA, governingLaw: "Delaware" };
    sendChat.mockResolvedValue({ reply: "Noted.", data: updated });
    const user = userEvent.setup();

    render(<Home />);

    // Placeholder shows until the field is filled.
    expect(screen.getByText("[Governing Law]")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Message"), "Delaware law");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Delaware")).toBeInTheDocument();
    expect(screen.queryByText("[Governing Law]")).not.toBeInTheDocument();
  });
});
