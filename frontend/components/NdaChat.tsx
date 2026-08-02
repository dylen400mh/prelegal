"use client";

import { useEffect, useRef, useState } from "react";
import { sendChat, type ChatMessage } from "@/nda/chat";
import type { MndaData } from "@/nda/types";

interface NdaChatProps {
  data: MndaData;
  onChange: (data: MndaData) => void;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'll help you put together a Mutual NDA. Just tell me about the " +
    "agreement in your own words — who the two parties are, what it's for, " +
    "and any terms you have in mind. I'll ask about anything I still need, " +
    "and the document on the right will fill in as we go.",
};

export default function NdaChat({ data, onChange }: NdaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async () => {
    const content = input.trim();
    if (!content || busy) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setError(null);
    setBusy(true);
    try {
      const res = await sendChat(next, data);
      setMessages([...next, { role: "assistant", content: res.reply }]);
      onChange(res.data);
    } catch {
      setError("Something went wrong reaching the assistant. Please try again.");
      setMessages(messages);
      setInput(content);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-5"
        style={{ maxHeight: "calc(100vh - 16rem)", minHeight: "24rem" }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm " +
                (m.role === "user"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-800")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">
              Thinking…
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="px-5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            rows={2}
            value={input}
            disabled={busy}
            aria-label="Message"
            placeholder="Describe your NDA or answer the question…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || input.trim().length === 0}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
