// Client for the document chat backend (POST /api/chat). Served from the same
// origin as the backend in the container, so a relative URL works.

import type { DocumentData } from "./types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  data: DocumentData;
}

export async function sendChat(
  messages: ChatMessage[],
  data: DocumentData,
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, data }),
  });
  if (!res.ok) {
    throw new Error(`Chat request failed (${res.status})`);
  }
  return res.json();
}
