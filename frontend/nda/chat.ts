// Client for the NDA chat backend (POST /api/chat). Served from the same origin
// as the backend in the container, so a relative URL works.

import type { MndaData } from "./types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  data: MndaData;
}

export async function sendChat(
  messages: ChatMessage[],
  data: MndaData,
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
