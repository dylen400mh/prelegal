import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentChat from "./DocumentChat";
import { EMPTY_DOCUMENT, type DocumentData } from "@/nda/types";

function mockFetchOnce(reply: string, data: DocumentData) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ reply, data }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("DocumentChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the initial assistant greeting", () => {
    render(<DocumentChat data={EMPTY_DOCUMENT} onChange={() => {}} />);
    expect(
      screen.getByText(/I can help you create a legal document/),
    ).toBeInTheDocument();
  });

  it("sends a message and applies the returned document", async () => {
    const updated: DocumentData = {
      docType: "mutual-nda",
      coverFields: [{ label: "Purpose", value: "Evaluating a deal." }],
      parties: [],
    };
    const fetchMock = mockFetchOnce("A Mutual NDA — got it.", updated);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<DocumentChat data={EMPTY_DOCUMENT} onChange={onChange} />);

    await user.type(screen.getByLabelText("Message"), "I need an NDA");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("I need an NDA")).toBeInTheDocument();
    expect(await screen.findByText("A Mutual NDA — got it.")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(updated);

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.data.docType).toBe("");
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "I need an NDA" });
  });

  it("surfaces an error and restores the input when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<DocumentChat data={EMPTY_DOCUMENT} onChange={onChange} />);
    await user.type(screen.getByLabelText("Message"), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Message")).toHaveValue("hello");
  });
});
