import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

/**
 * End-to-end wiring of the page: the form drives the shared state, and the
 * preview re-renders from it. (The PDF library is only imported when the
 * Download button is clicked, so rendering the page never loads it.)
 */
describe("Home page", () => {
  it("renders the form and the live preview together", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "Mutual NDA Creator", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Agreement terms")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
  });

  it("flows a typed governing-law value into the preview", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Placeholder shows until the field is filled.
    expect(screen.getByText("[Governing Law]")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Governing law (state)"), "Delaware");

    expect(screen.getByText("Delaware")).toBeInTheDocument();
    expect(screen.queryByText("[Governing Law]")).not.toBeInTheDocument();
  });

  it("flows the perpetuity toggle into the preview", async () => {
    const user = userEvent.setup();
    render(<Home />);

    expect(screen.queryByText("In perpetuity.")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText(/In perpetuity/));
    expect(screen.getByText("In perpetuity.")).toBeInTheDocument();
  });
});
