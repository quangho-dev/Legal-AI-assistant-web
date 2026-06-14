import type {
  RetrievalSettings,
  RetrievalSettingsInput,
} from "@/lib/types/retrieval-settings";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";

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

export async function getRetrievalSettings(
  token?: string | null
): Promise<RetrievalSettings | null> {
  const response = await apiFetch(`${API_URL}/api/retrieval-settings`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data ?? null;
}

export async function createRetrievalSettings(
  payload: RetrievalSettingsInput,
  token?: string | null
): Promise<RetrievalSettings> {
  const response = await apiFetch(`${API_URL}/api/retrieval-settings`, {
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

export async function updateRetrievalSettings(
  payload: RetrievalSettingsInput,
  token?: string | null
): Promise<RetrievalSettings> {
  const response = await apiFetch(`${API_URL}/api/retrieval-settings`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}
