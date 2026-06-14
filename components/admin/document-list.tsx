"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getProcessingStatusLabel } from "@/lib/document-utils";
import type { DocumentRecord } from "@/lib/types/documents";
import { cn } from "@/lib/utils";
import { FileText, Globe, Loader2 } from "lucide-react";

type DocumentListProps = {
  documents: DocumentRecord[];
  isLoading: boolean;
};

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "completed") return "default";
  if (status === "pending" || status === "queued") return "secondary";
  return "outline";
}

function isProcessing(status: string): boolean {
  return !["completed", "pending"].includes(status);
}

export function DocumentList({ documents, isLoading }: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Chưa có tài liệu nào. Tải file hoặc thêm URL để trợ lý có thể sử dụng
        nội dung đó.
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[420px] pr-3">
      <div className="space-y-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                {document.source_type === "url" ? (
                  <Globe className="size-4" />
                ) : (
                  <FileText className="size-4" />
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium">
                  {document.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {document.source_type === "url" ? "URL" : document.file_type}
                  {" · "}
                  {new Date(document.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            <Badge
              variant={statusVariant(document.processing_status)}
              className={cn(
                "shrink-0 gap-1",
                isProcessing(document.processing_status) && "animate-pulse"
              )}
            >
              {isProcessing(document.processing_status) && (
                <Loader2 className="size-3 animate-spin" />
              )}
              {getProcessingStatusLabel(document.processing_status)}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
