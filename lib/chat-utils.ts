import type { ChatSession, Citation } from "@/lib/types/chat";

export function createChatSession(title = "Cuộc trò chuyện mới"): ChatSession {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildChatTitle(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "Cuộc trò chuyện mới";
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed;
}

export const LEGAL_STARTER_PROMPTS = [
  "Các yếu tố cần thiết của một hợp đồng hợp lệ là gì?",
  "Giải thích sự khác biệt giữa luật dân sự và luật hình sự.",
  "Quy trình pháp lý khi chấm dứt hợp đồng lao động là gì?",
  "Quyền bảo mật giữa luật sư và khách hàng hoạt động như thế nào?",
];

export function formatLawDisplayName(citation: Citation): string {
  if (citation.lawName?.trim()) {
    return citation.lawName.trim();
  }

  return "Văn bản pháp luật";
}

export function displayCitationValue(value?: string): string {
  return value?.trim() || "—";
}
