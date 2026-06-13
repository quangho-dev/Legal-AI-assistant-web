import type {
  SendChatMessageRequest,
  SendChatMessageResponse,
} from "@/lib/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8002";

export async function sendChatMessage(
  payload: SendChatMessageRequest,
  token?: string | null
): Promise<SendChatMessageResponse> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Gửi tin nhắn thất bại");
  }

  return response.json();
}
