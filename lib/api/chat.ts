import type {
  ChatSession,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from "@/lib/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(token?: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((item: { msg?: string }) => item.msg).join(", ");
    }
    return JSON.stringify(body);
  } catch {
    return `Yêu cầu thất bại (${response.status})`;
  }
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(
      "Không thể kết nối API. Kiểm tra server đang chạy và NEXT_PUBLIC_API_URL."
    );
  }
}

export async function listChats(
  token?: string | null
): Promise<ChatSession[]> {
  const response = await apiFetch(`${API_URL}/api/chats`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data ?? [];
}

export async function createChat(
  payload: { title?: string; id?: string },
  token?: string | null
): Promise<ChatSession> {
  const response = await apiFetch(`${API_URL}/api/chats`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}

export async function sendChatMessage(
  payload: SendChatMessageRequest,
  token?: string | null
): Promise<SendChatMessageResponse> {
  const response = await apiFetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}
