"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { DocumentMonitorCard } from "@/components/admin/document-monitor-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteDocument, listDocumentsMonitor } from "@/lib/api/documents";
import { isActiveProcessingStatus } from "@/lib/document-utils";
import type { DocumentMonitorRecord } from "@/lib/types/documents";

type DocumentMonitorDashboardProps = {
  title?: string;
  description?: string;
  showHeader?: boolean;
};

export function DocumentMonitorDashboard({
  title = "Theo dõi embedding",
  description = "Giám sát realtime quá trình phân tích, embedding và lưu trữ tài liệu vào database.",
  showHeader = true,
}: DocumentMonitorDashboardProps) {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<DocumentMonitorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);

      try {
        const token = await getToken();
        const data = await listDocumentsMonitor(token);
        setDocuments(data);
        setLastUpdated(new Date());
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu giám sát"
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [getToken]
  );

  const handleDeleteDocument = useCallback(
    async (documentId: string) => {
      setDeletingId(documentId);

      try {
        const token = await getToken();
        await deleteDocument(documentId, token);
        setDocuments((current) =>
          current.filter((document) => document.id !== documentId)
        );
        setLastUpdated(new Date());
        toast.success("Đã xóa tài liệu");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Không thể xóa tài liệu"
        );
      } finally {
        setDeletingId(null);
      }
    },
    [getToken]
  );

  useEffect(() => {
    void loadDocuments(true);
  }, [loadDocuments]);

  const hasActiveJobs = useMemo(
    () =>
      documents.some((document) =>
        isActiveProcessingStatus(document.processing_status)
      ),
    [documents]
  );

  useEffect(() => {
    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      void loadDocuments(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasActiveJobs, loadDocuments]);

  const stats = useMemo(() => {
    const total = documents.length;
    const completed = documents.filter(
      (document) => document.processing_status === "completed"
    ).length;
    const processing = documents.filter((document) =>
      isActiveProcessingStatus(document.processing_status)
    ).length;
    const storedChunks = documents.reduce(
      (sum, document) => sum + document.chunk_count,
      0
    );

    return { total, completed, processing, storedChunks };
  }, [documents]);

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN")}
                {hasActiveJobs ? " · Tự động làm mới mỗi 3 giây" : ""}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => void loadDocuments()}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Làm mới
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Activity className="size-4 text-primary" />}
          label="Tổng tài liệu"
          value={stats.total}
        />
        <SummaryCard
          icon={<Loader2 className="size-4 text-amber-400" />}
          label="Đang xử lý"
          value={stats.processing}
        />
        <SummaryCard
          icon={<CheckCircle2 className="size-4 text-emerald-400" />}
          label="Hoàn thành"
          value={stats.completed}
        />
        <SummaryCard
          icon={<Clock3 className="size-4 text-sky-400" />}
          label="Chunks trong DB"
          value={stats.storedChunks}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tiến trình từng tài liệu</CardTitle>
          <CardDescription>
            Pipeline: chờ → S3 → hàng đợi → phân tích → chia đoạn → tóm tắt →
            embedding → lưu database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Chưa có tài liệu nào để giám sát.
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <DocumentMonitorCard
                  key={document.id}
                  document={document}
                  onDelete={handleDeleteDocument}
                  isDeleting={deletingId === document.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-background p-2">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
