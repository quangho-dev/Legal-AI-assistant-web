import type {
  CompareDocumentRecord,
  CompareDocumentsRequest,
  CompareDocumentsResponse,
  CompareUploadUrlResponse,
} from "@/lib/types/compare";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const MAX_COMPARE_FILE_SIZE = 25 * 1024 * 1024;

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

export async function listCompareDocuments(
  token?: string | null
): Promise<CompareDocumentRecord[]> {
  const response = await apiFetch(`${API_URL}/api/compare/documents`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data ?? [];
}

export async function getCompareDocumentStatus(
  documentId: string,
  token?: string | null
): Promise<CompareDocumentRecord> {
  const response = await apiFetch(
    `${API_URL}/api/compare/documents/${documentId}`,
    {
      headers: authHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}

export async function createCompareUploadUrl(
  payload: { filename: string; file_type: string; file_size: number },
  token?: string | null
): Promise<CompareUploadUrlResponse> {
  const response = await apiFetch(`${API_URL}/api/compare/upload-url`, {
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

export async function confirmCompareUpload(
  s3Key: string,
  token?: string | null
): Promise<CompareDocumentRecord> {
  const response = await apiFetch(`${API_URL}/api/compare/confirm`, {
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

export async function deleteCompareDocument(
  documentId: string,
  token?: string | null
): Promise<void> {
  const response = await apiFetch(
    `${API_URL}/api/compare/documents/${documentId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function renameCompareDocument(
  documentId: string,
  filename: string,
  token?: string | null
): Promise<CompareDocumentRecord> {
  const response = await apiFetch(
    `${API_URL}/api/compare/documents/${documentId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ filename }),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = await response.json();
  return body.data;
}

export async function uploadAndEmbedCompareDocument(
  file: File,
  token?: string | null
): Promise<CompareDocumentRecord> {
  const uploadData = await createCompareUploadUrl(
    {
      filename: file.name,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
    },
    token
  );

  await uploadFileToS3(uploadData.uploadUrl, file);
  return confirmCompareUpload(uploadData.s3Key, token);
}

export async function compareDocuments(
  payload: CompareDocumentsRequest,
  token?: string | null
): Promise<CompareDocumentsResponse> {
  const response = await apiFetch(`${API_URL}/api/compare`, {
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

export function validateCompareFile(file: File): string | null {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".md",
    ".pptx",
    ".html",
    ".htm",
  ];

  if (!allowedExtensions.includes(extension)) {
    return `Định dạng không hỗ trợ: ${file.name}`;
  }

  if (file.size > MAX_COMPARE_FILE_SIZE) {
    return `File vượt quá 25MB: ${file.name}`;
  }

  return null;
}

export function isCompareDocumentReady(document: CompareDocumentRecord): boolean {
  return document.processingStatus === "completed";
}

export function isCompareDocumentProcessing(
  document: CompareDocumentRecord
): boolean {
  return !["completed", "pending"].includes(document.processingStatus);
}
