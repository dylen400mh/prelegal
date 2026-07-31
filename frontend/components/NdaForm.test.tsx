import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaForm from "./NdaForm";
import { DEFAULT_MNDA, type MndaData } from "@/nda/types";

/**
 * NdaForm is fully controlled, so a stateful harness is needed for typing to
 * accumulate. The current state is dumped as JSON for assertions.
 */
function Harness({ initial = DEFAULT_MNDA }: { initial?: MndaData }) {
  const [data, setData] = useState<MndaData>(initial);
  return (
    <>
      <NdaForm data={data} onChange={setData} />
      <pre data-testid="state">{JSON.stringify(data)}</pre>
    </>
  );
}

const readState = (): MndaData =>
  JSON.parse(screen.getByTestId("state").textContent ?? "{}");

describe("NdaForm", () => {
  it("renders the agreement-term and both party fieldsets", () => {
    render(<Harness />);
    expect(screen.getByText("Agreement terms")).toBeInTheDocument();
    expect(screen.getByText("Party 1")).toBeInTheDocument();
    expect(screen.getByText("Party 2")).toBeInTheDocument();
  });

  it("updates the purpose as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ ...DEFAULT_MNDA, purpose: "" }} />);
    await user.type(screen.getByLabelText("Purpose"), "Evaluate a deal");
    expect(readState().purpose).toBe("Evaluate a deal");
  });

  it("captures governing law and jurisdiction", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText("Governing law (state)"), "Delaware");
    await user.type(screen.getByLabelText("Jurisdiction"), "New Castle, DE");
    const state = readState();
    expect(state.governingLaw).toBe("Delaware");
    expect(state.jurisdiction).toBe("New Castle, DE");
  });

  it("switches the MNDA term to until-terminated", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText(/Continues until terminated/));
    expect(readState().mndaTermMode).toBe("untilTerminated");
  });

  it("disables the MNDA year input unless 'Expires' is selected", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const yearInput = screen.getByRole("spinbutton", {
      name: "MNDA term length in years",
    });
    expect(yearInput).toBeEnabled();
    await user.click(screen.getByLabelText(/Continues until terminated/));
    expect(yearInput).toBeDisabled();
  });

  it("switches confidentiality to perpetuity", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText(/In perpetuity/));
    expect(readState().confidentialityMode).toBe("perpetuity");
  });

  it("keeps the last valid year while cleared, then normalizes to 1 on blur", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ ...DEFAULT_MNDA, mndaTermYears: 2 }} />);
    const yearInput = screen.getByRole("spinbutton", {
      name: "MNDA term length in years",
    });
    await user.clear(yearInput);
    // The committed value is untouched until a valid entry or blur.
    expect(readState().mndaTermYears).toBe(2);
    await user.tab();
    expect(readState().mndaTermYears).toBe(1);
  });

  it("lets the user clear the year field and type a new value", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ ...DEFAULT_MNDA, mndaTermYears: 1 }} />);
    const yearInput = screen.getByRole("spinbutton", {
      name: "MNDA term length in years",
    });
    await user.clear(yearInput);
    await user.type(yearInput, "5");
    expect(readState().mndaTermYears).toBe(5);
  });

  it("records details for each party independently", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const party1 = screen.getByText("Party 1").closest("fieldset")!;
    const party2 = screen.getByText("Party 2").closest("fieldset")!;

    await user.type(within(party1).getByLabelText("Company"), "Acme, Inc.");
    await user.type(within(party2).getByLabelText("Company"), "Globex LLC");

    const state = readState();
    expect(state.party1.company).toBe("Acme, Inc.");
    expect(state.party2.company).toBe("Globex LLC");
  });
});
