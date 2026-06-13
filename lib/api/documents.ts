import type {
  DocumentMonitorRecord,
  DocumentRecord,
  UploadUrlResponse,
} from "@/lib/types/documents";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8002";

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

export async function listDocuments(
  token?: string | null
): Promise<DocumentRecord[]> {
  const response = await apiFetch(`${API_URL}/api/files`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data ?? [];
}

export async function listDocumentsMonitor(
  token?: string | null
): Promise<DocumentMonitorRecord[]> {
  const response = await apiFetch(`${API_URL}/api/files/monitor`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data ?? [];
}

export async function createUploadUrl(
  payload: { filename: string; file_type: string; file_size: number },
  token?: string | null
): Promise<UploadUrlResponse> {
  const response = await apiFetch(`${API_URL}/api/files/upload-url`, {
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

export async function uploadFileToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error("Tải file lên lưu trữ thất bại");
  }
}

export async function confirmFileUpload(
  s3Key: string,
  token?: string | null
): Promise<DocumentRecord> {
  const response = await apiFetch(`${API_URL}/api/files/confirm`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ s3_key: s3Key }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}

export async function submitDocumentUrl(
  url: string,
  token?: string | null
): Promise<DocumentRecord> {
  const response = await apiFetch(`${API_URL}/api/files/urls`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}

export async function deleteDocument(
  documentId: string,
  token?: string | null
): Promise<DocumentRecord> {
  const response = await apiFetch(`${API_URL}/api/files/${documentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}
