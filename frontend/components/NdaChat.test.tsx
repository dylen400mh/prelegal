import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaChat from "./NdaChat";
import { DEFAULT_MNDA, type MndaData } from "@/nda/types";

function mockFetchOnce(reply: string, data: MndaData) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ reply, data }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("NdaChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the initial assistant greeting", () => {
    render(<NdaChat data={DEFAULT_MNDA} onChange={() => {}} />);
    expect(screen.getByText(/I'll help you put together a Mutual NDA/)).toBeInTheDocument();
  });

  it("sends a message and applies the returned data", async () => {
    const updated: MndaData = { ...DEFAULT_MNDA, governingLaw: "Delaware" };
    const fetchMock = mockFetchOnce("Got it — Delaware it is.", updated);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<NdaChat data={DEFAULT_MNDA} onChange={onChange} />);

    await user.type(screen.getByLabelText("Message"), "Governing law is Delaware");
    await user.click(screen.getByRole("button", { name: "Send" }));

    // User message and assistant reply both render.
    expect(screen.getByText("Governing law is Delaware")).toBeInTheDocument();
    expect(await screen.findByText("Got it — Delaware it is.")).toBeInTheDocument();

    // The extracted data is pushed up to the parent.
    expect(onChange).toHaveBeenCalledWith(updated);

    // The request carried the current data and the user message.
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.data.governingLaw).toBe("");
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "Governing law is Delaware" });
  });

  it("surfaces an error and restores the input when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<NdaChat data={DEFAULT_MNDA} onChange={onChange} />);
    await user.type(screen.getByLabelText("Message"), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
    expect(onChange).not.toHaveBeenCalled();
    // Input is restored so the user doesn't lose their message.
    expect(screen.getByLabelText("Message")).toHaveValue("hello");
  });
});
