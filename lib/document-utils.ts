import type {
  ProcessingElementsSummary,
  SummarisingProgress,
} from "@/lib/types/documents";

const STATUS_LABELS: Record<string, string> = {
  uploading: "Đang tải lên",
  pending: "Chờ xử lý",
  uploaded: "Tải lên S3 thành công",
  queued: "Đang chờ hàng đợi",
  processing: "Đang xử lý",
  partitioning: "Đang phân tích nội dung",
  chunking: "Đang chia đoạn",
  summarising: "Đang tóm tắt AI",
  vectorization: "Đang tạo embedding",
  completed: "Hoàn thành",
};

export const PIPELINE_STEPS = [
  { key: "pending", label: "Chờ xử lý", description: "Tài liệu đã được tạo" },
  {
    key: "uploaded",
    label: "Tải S3 thành công",
    description: "File đã lưu trên S3",
  },
  { key: "queued", label: "Hàng đợi", description: "Chờ worker xử lý" },
  {
    key: "processing",
    label: "Bắt đầu xử lý",
    description: "Worker nhận tác vụ",
  },
  {
    key: "partitioning",
    label: "Phân tích nội dung",
    description: "Trích xuất văn bản, bảng, hình",
  },
  {
    key: "chunking",
    label: "Chia đoạn",
    description: "Tách thành các chunks",
  },
  {
    key: "summarising",
    label: "Tóm tắt AI",
    description: "Tạo nội dung tìm kiếm",
  },
  {
    key: "vectorization",
    label: "Tạo embedding",
    description: "Vector hóa từng chunk",
  },
  {
    key: "completed",
    label: "Hoàn thành",
    description: "Đã lưu vào database",
  },
] as const;

export function getProcessingStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function getCurrentPipelineStep(status: string) {
  return (
    PIPELINE_STEPS.find((step) => step.key === status) ??
    PIPELINE_STEPS[0]
  );
}

export function isActiveProcessingStatus(status: string): boolean {
  return !["completed", "pending"].includes(status);
}

export function getUploadedMessage(
  processingDetails?: Record<string, unknown>
): string | null {
  const uploaded = processingDetails?.uploaded as
    | { message?: string; s3_key?: string; source_url?: string }
    | undefined;

  return uploaded?.message ?? null;
}

export function getPipelineStepIndex(status: string): number {
  const index = PIPELINE_STEPS.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
}

export function getPipelineProgress(
  status: string,
  processingDetails?: Record<string, unknown>
): number {
  if (status === "completed") return 100;

  const stepIndex = getPipelineStepIndex(status);
  const totalSteps = PIPELINE_STEPS.length - 1;
  const stepSize = 100 / totalSteps;
  let progress = stepIndex * stepSize;

  if (status === "summarising") {
    const summarising = processingDetails?.summarising as
      | SummarisingProgress
      | undefined;

    if (summarising?.total_chunks && summarising.current_chunk) {
      const ratio = summarising.current_chunk / summarising.total_chunks;
      progress = progress - stepSize + stepSize * ratio;
    }
  }

  return Math.max(5, Math.min(Math.round(progress), 99));
}

export function getElementsSummary(
  processingDetails?: Record<string, unknown>
): ProcessingElementsSummary | null {
  const partitioning = processingDetails?.partitioning as
    | { elements_found?: ProcessingElementsSummary }
    | undefined;

  return partitioning?.elements_found ?? null;
}

export function getTotalChunks(
  processingDetails?: Record<string, unknown>
): number | null {
  const chunking = processingDetails?.chunking as
    | { total_chunks?: number }
    | undefined;

  return chunking?.total_chunks ?? null;
}

export function getSummarisingProgress(
  processingDetails?: Record<string, unknown>
): SummarisingProgress | null {
  const summarising = processingDetails?.summarising as
    | SummarisingProgress
    | undefined;

  if (!summarising?.total_chunks) return null;
  return summarising;
}

export const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".html",
  ".htm",
];

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/html",
];
