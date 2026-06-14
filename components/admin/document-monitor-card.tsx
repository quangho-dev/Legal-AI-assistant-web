"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  Globe,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

import { ProcessingPipeline } from "@/components/admin/processing-pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  getElementsSummary,
  getPipelineProgress,
  getProcessingStatusLabel,
  getCurrentPipelineStep,
  getSummarisingProgress,
  getTotalChunks,
  getUploadedMessage,
  isActiveProcessingStatus,
} from "@/lib/document-utils";
import type { DocumentMonitorRecord } from "@/lib/types/documents";
import { cn } from "@/lib/utils";

type DocumentMonitorCardProps = {
  document: DocumentMonitorRecord;
  onDelete?: (documentId: string) => void;
  onRename?: (documentId: string, filename: string) => Promise<void>;
  isDeleting?: boolean;
  isRenaming?: boolean;
};

function statusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "completed") return "default";
  if (status === "uploaded") return "default";
  if (status === "pending" || status === "queued") return "secondary";
  return "outline";
}

function getEditableName(filename: string, sourceType?: string): string {
  if (sourceType === "url") {
    return filename;
  }

  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return filename;
  return filename.slice(0, lastDot);
}

export function DocumentMonitorCard({
  document,
  onDelete,
  onRename,
  isDeleting = false,
  isRenaming = false,
}: DocumentMonitorCardProps) {
  const [expanded, setExpanded] = useState(
    isActiveProcessingStatus(document.processing_status)
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(document.filename);

  useEffect(() => {
    if (!isEditingName) {
      setNameInput(getEditableName(document.filename, document.source_type));
    }
  }, [document.filename, document.source_type, isEditingName]);

  const progress = getPipelineProgress(
    document.processing_status,
    document.processing_details
  );
  const elementsSummary = getElementsSummary(document.processing_details);
  const totalChunks = getTotalChunks(document.processing_details);
  const summarisingProgress = getSummarisingProgress(document.processing_details);
  const uploadedMessage = getUploadedMessage(document.processing_details);
  const currentStep = getCurrentPipelineStep(document.processing_status);

  function startEditingName() {
    setNameInput(getEditableName(document.filename, document.source_type));
    setIsEditingName(true);
    setConfirmDelete(false);
  }

  function cancelEditingName() {
    setIsEditingName(false);
    setNameInput(getEditableName(document.filename, document.source_type));
  }

  async function saveName() {
    if (!onRename) return;

    const trimmed = nameInput.trim();
    if (!trimmed) return;

    await onRename(document.id, trimmed);
    setIsEditingName(false);
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
            {document.source_type === "url" ? (
              <Globe className="size-4" />
            ) : (
              <FileText className="size-4" />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            {isEditingName ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  className="h-8 text-sm"
                  disabled={isRenaming}
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveName();
                    }
                    if (event.key === "Escape") {
                      cancelEditingName();
                    }
                  }}
                />
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isRenaming || !nameInput.trim()}
                    onClick={() => void saveName()}
                  >
                    {isRenaming ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Lưu"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={isRenaming}
                    onClick={cancelEditingName}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="truncate text-sm font-medium">{document.filename}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(document.created_at).toLocaleString("vi-VN")}
              {document.task_id ? ` · Task ${document.task_id.slice(0, 8)}…` : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={statusVariant(document.processing_status)}>
            {getProcessingStatusLabel(document.processing_status)}
          </Badge>

          {onRename && !isEditingName && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              disabled={isDeleting || isRenaming}
              onClick={startEditingName}
              title="Đổi tên tài liệu"
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {onDelete &&
            (confirmDelete ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={isDeleting}
                  onClick={() => onDelete(document.id)}
                >
                  {isDeleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Xóa"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={isDeleting}
                  onClick={() => setConfirmDelete(false)}
                >
                  Hủy
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(true)}
                title="Xóa tài liệu"
              >
                <Trash2 className="size-4" />
              </Button>
            ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-2">
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-muted-foreground">Tiến trình xử lý</span>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                Bước hiện tại: {currentStep.label}
              </p>
            </div>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <ProcessingPipeline status={document.processing_status} />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill
            icon={<Database className="size-3.5" />}
            label="Đoạn đã lưu"
            value={String(document.chunk_count)}
          />
          {totalChunks !== null && (
            <StatPill label="Tổng đoạn" value={String(totalChunks)} />
          )}
          {summarisingProgress && (
            <StatPill
              label="Tóm tắt"
              value={`${summarisingProgress.current_chunk ?? 0}/${summarisingProgress.total_chunks}`}
            />
          )}
          {elementsSummary && (
            <StatPill
              label="Phần tử"
              value={String(
                (elementsSummary.text ?? 0) +
                  (elementsSummary.tables ?? 0) +
                  (elementsSummary.images ?? 0)
              )}
            />
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full gap-1 text-xs"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3.5" />
              Thu gọn chi tiết
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              Xem chi tiết
            </>
          )}
        </Button>

        {expanded && (
          <div className="space-y-3 rounded-lg border bg-background/60 p-3 text-xs">
            {uploadedMessage && (
              <DetailBlock title="Lưu trữ">
                <p className="text-primary">{uploadedMessage}</p>
              </DetailBlock>
            )}

            {elementsSummary && (
              <DetailBlock title="Phân tích nội dung">
                <DetailRow label="Văn bản" value={elementsSummary.text ?? 0} />
                <DetailRow label="Bảng" value={elementsSummary.tables ?? 0} />
                <DetailRow label="Hình ảnh" value={elementsSummary.images ?? 0} />
                <DetailRow label="Tiêu đề" value={elementsSummary.titles ?? 0} />
              </DetailBlock>
            )}

            {totalChunks !== null && (
              <DetailBlock title="Chia đoạn">
                <DetailRow label="Tổng đoạn" value={totalChunks} />
              </DetailBlock>
            )}

            {document.chunk_count > 0 && (
              <DetailBlock title="Đã lưu cho trợ lý">
                <DetailRow
                  label="Đoạn đã lưu"
                  value={document.chunk_count}
                  highlight
                />
                <p className="text-muted-foreground">
                  Tài liệu đã sẵn sàng để trợ lý tra cứu khi trả lời câu hỏi.
                </p>
              </DetailBlock>
            )}

            {!elementsSummary &&
              !totalChunks &&
              document.chunk_count === 0 &&
              document.processing_status !== "completed" && (
                <p className="text-muted-foreground">
                  Đang chờ hệ thống xử lý tài liệu...
                </p>
              )}

            {document.processing_status === "completed" && (
              <p
                className={cn(
                  "font-medium",
                  document.chunk_count > 0 ? "text-primary" : "text-muted-foreground"
                )}
              >
                {document.chunk_count > 0
                  ? `Hoàn tất: ${document.chunk_count} đoạn tài liệu đã sẵn sàng cho trợ lý.`
                  : "Hoàn tất xử lý nhưng chưa có nội dung nào được lưu."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background/70 px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-foreground">{title}</p>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-semibold text-primary" : ""}>
        {value}
      </span>
    </div>
  );
}
