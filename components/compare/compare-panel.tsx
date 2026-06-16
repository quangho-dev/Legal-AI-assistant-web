"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  FileText,
  FolderOpen,
  GitCompare,
  Loader2,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { MarkdownMessage } from "@/components/chat/markdown-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  compareDocuments,
  deleteCompareDocument,
  isCompareDocumentProcessing,
  isCompareDocumentReady,
  listCompareDocuments,
  renameCompareDocument,
  uploadAndEmbedCompareDocument,
  validateCompareFile,
} from "@/lib/api/compare";
import type {
  CompareDocumentRecord,
  CompareDocumentsResponse,
} from "@/lib/types/compare";
import {
  getEditableDocumentName,
  getProcessingStatusLabel,
  isActiveProcessingStatus,
} from "@/lib/document-utils";
import { cn } from "@/lib/utils";

const DEFAULT_INSTRUCTION =
  "So sánh các điểm giống và khác về quyền, nghĩa vụ, điều kiện áp dụng và mức xử lý giữa văn bản gốc với các văn bản tham khảo.";

const AGENT_LABELS: Record<string, string> = {
  Parser: "Đọc tài liệu",
  Classifier: "Nhận diện loại văn bản",
  Planner: "Lập kế hoạch",
  Analyst: "Phân tích cấu trúc",
  Mapper: "Xác định chủ đề",
  Comparator: "Đối chiếu chi tiết",
  Reporter: "Tổng hợp báo cáo",
};

const ACCEPTED_COMPARE_TYPES =
  ".pdf,.doc,.docx,.txt,.md,.pptx,.html,.htm";

const POLL_INTERVAL_MS = 3000;

function statusVariant(status: string) {
  if (status === "completed") return "default" as const;
  if (isActiveProcessingStatus(status)) return "secondary" as const;
  return "outline" as const;
}

export function ComparePanel() {
  const { getToken } = useAuth();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<CompareDocumentRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [sourceDocumentId, setSourceDocumentId] = useState("");
  const [referenceDocumentIds, setReferenceDocumentIds] = useState<string[]>(
    []
  );
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<CompareDocumentsResponse | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [renamingDocumentId, setRenamingDocumentId] = useState<string | null>(
    null
  );

  const refreshDocuments = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await listCompareDocuments(token);
      setDocuments(data);
      return data;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải kho tài liệu"
      );
      return [];
    }
  }, [getToken]);

  useEffect(() => {
    async function load() {
      setIsLoadingDocs(true);
      await refreshDocuments();
      setIsLoadingDocs(false);
    }

    void load();
  }, [refreshDocuments]);

  useEffect(() => {
    const hasProcessing = documents.some((doc) =>
      isCompareDocumentProcessing(doc)
    );

    if (!hasProcessing) return;

    const interval = window.setInterval(() => {
      void refreshDocuments();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [documents, refreshDocuments]);

  const readyDocuments = documents.filter(isCompareDocumentReady);
  const availableReferences = readyDocuments.filter(
    (doc) => doc.id !== sourceDocumentId
  );

  function toggleReferenceDocument(documentId: string) {
    setReferenceDocumentIds((current) => {
      if (current.includes(documentId)) {
        return current.filter((id) => id !== documentId);
      }
      if (current.length >= 5) {
        toast.error("Chỉ chọn tối đa 5 tài liệu tham khảo");
        return current;
      }
      return [...current, documentId];
    });
  }

  async function handleUploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const token = await getToken();

      for (const file of files) {
        const error = validateCompareFile(file);
        if (error) {
          toast.error(error);
          continue;
        }

        const document = await uploadAndEmbedCompareDocument(file, token);
        toast.success(`Đã tải "${file.name}". Đang embed...`);

        if (document.processingStatus === "completed") {
          setSourceDocumentId((current) => current || document.id);
        }
      }

      await refreshDocuments();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải file lên"
      );
    } finally {
      setIsUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }

  async function handleDeleteDocument(documentId: string) {
    try {
      const token = await getToken();
      await deleteCompareDocument(documentId, token);
      setSourceDocumentId((current) =>
        current === documentId ? "" : current
      );
      setReferenceDocumentIds((current) =>
        current.filter((id) => id !== documentId)
      );
      if (editingDocumentId === documentId) {
        setEditingDocumentId(null);
        setNameInput("");
      }
      await refreshDocuments();
      toast.success("Đã xóa tài liệu");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa tài liệu"
      );
    }
  }

  function startEditingName(document: CompareDocumentRecord) {
    setEditingDocumentId(document.id);
    setNameInput(getEditableDocumentName(document.filename));
  }

  function cancelEditingName() {
    setEditingDocumentId(null);
    setNameInput("");
  }

  async function handleRenameDocument(documentId: string) {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Tên tài liệu không được để trống");
      return;
    }

    setRenamingDocumentId(documentId);

    try {
      const token = await getToken();
      await renameCompareDocument(documentId, trimmed, token);
      setEditingDocumentId(null);
      setNameInput("");
      await refreshDocuments();
      toast.success("Đã đổi tên tài liệu");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể đổi tên tài liệu"
      );
    } finally {
      setRenamingDocumentId(null);
    }
  }

  async function handleCompare() {
    if (!sourceDocumentId) {
      toast.error("Vui lòng chọn tài liệu gốc");
      return;
    }

    if (referenceDocumentIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tài liệu tham khảo");
      return;
    }

    if (instruction.trim().length < 10) {
      toast.error("Yêu cầu so sánh phải có ít nhất 10 ký tự");
      return;
    }

    setIsComparing(true);
    setResult(null);

    try {
      const token = await getToken();
      const response = await compareDocuments(
        {
          sourceDocumentId,
          referenceDocumentIds,
          instruction: instruction.trim(),
        },
        token
      );
      setResult(response);
      toast.success("Hoàn tất so sánh tài liệu");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể so sánh tài liệu"
      );
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <SidebarInset className="h-svh overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">So sánh tài liệu</h1>
          <p className="truncate text-xs text-muted-foreground">
            Tải và embed tài liệu một lần, tái sử dụng cho các lần so sánh sau
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="size-5 text-primary" />
                Kho tài liệu của bạn
              </CardTitle>
              <CardDescription>
                Tài liệu được lưu và embed riêng cho tài khoản của bạn. Lần sau
                có thể chọn lại mà không cần tải và xử lý lại.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={uploadInputRef}
                type="file"
                accept={ACCEPTED_COMPARE_TYPES}
                multiple
                className="hidden"
                onChange={(event) => void handleUploadFiles(event)}
                disabled={isUploading || isComparing}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={isUploading || isComparing}
                onClick={() => uploadInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {isUploading ? "Đang tải và embed..." : "Tải tài liệu mới"}
              </Button>

              {isLoadingDocs ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Chưa có tài liệu nào. Tải file gốc hoặc tham khảo để hệ thống
                  embed và lưu vào kho.
                </div>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border p-3">
                  {documents.map((document) => {
                    const isEditing = editingDocumentId === document.id;
                    const isRenaming = renamingDocumentId === document.id;

                    return (
                      <div
                        key={document.id}
                        className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <Input
                                value={nameInput}
                                onChange={(event) =>
                                  setNameInput(event.target.value)
                                }
                                className="h-8 text-sm"
                                disabled={isRenaming}
                                autoFocus
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    void handleRenameDocument(document.id);
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
                                  onClick={() =>
                                    void handleRenameDocument(document.id)
                                  }
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
                            <p className="truncate text-sm font-medium">
                              {document.filename}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              variant={statusVariant(document.processingStatus)}
                            >
                              {isCompareDocumentProcessing(document) && (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                              )}
                              {getProcessingStatusLabel(
                                document.processingStatus
                              )}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {!isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 text-muted-foreground"
                              disabled={isComparing || isUploading}
                              onClick={() => startEditingName(document)}
                              title="Đổi tên"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={isComparing || isUploading || isRenaming}
                            onClick={() => void handleDeleteDocument(document.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="size-5 text-primary" />
                Thiết lập so sánh
              </CardTitle>
              <CardDescription>
                Chọn tài liệu đã embed sẵn từ kho, hoặc tải file mới ở trên rồi
                chờ trạng thái &quot;Hoàn thành&quot; trước khi so sánh.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoadingDocs ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : readyDocuments.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Chưa có tài liệu sẵn sàng. Tải file lên và đợi embed hoàn tất.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="source-document">Tài liệu gốc</Label>
                    <select
                      id="source-document"
                      className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                      value={sourceDocumentId}
                      onChange={(event) => {
                        setSourceDocumentId(event.target.value);
                        setReferenceDocumentIds((current) =>
                          current.filter((id) => id !== event.target.value)
                        );
                      }}
                      disabled={isComparing}
                    >
                      <option value="">Chọn tài liệu gốc...</option>
                      {readyDocuments.map((document) => (
                        <option key={document.id} value={document.id}>
                          {document.filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tài liệu tham khảo (chọn 1–5)</Label>
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border p-3">
                      {availableReferences.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Chọn tài liệu gốc trước.
                        </p>
                      ) : (
                        availableReferences.map((document) => {
                          const checked = referenceDocumentIds.includes(
                            document.id
                          );
                          return (
                            <label
                              key={document.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition-colors",
                                checked
                                  ? "border-primary/40 bg-primary/5"
                                  : "hover:bg-muted/40"
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 size-4 accent-primary"
                                checked={checked}
                                disabled={isComparing}
                                onChange={() =>
                                  toggleReferenceDocument(document.id)
                                }
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                  {document.filename}
                                </span>
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compare-instruction">
                      Yêu cầu so sánh tùy biến
                    </Label>
                    <Textarea
                      id="compare-instruction"
                      value={instruction}
                      onChange={(event) => setInstruction(event.target.value)}
                      className="min-h-28"
                      disabled={isComparing}
                      placeholder="Mô tả những gì bạn muốn đối chiếu..."
                    />
                  </div>

                  <Button
                    onClick={() => void handleCompare()}
                    disabled={
                      isComparing ||
                      !sourceDocumentId ||
                      referenceDocumentIds.length === 0
                    }
                    className="gap-2"
                  >
                    {isComparing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {isComparing ? "Đang phân tích..." : "Bắt đầu so sánh"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {isComparing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tiến trình agent</CardTitle>
                <CardDescription>
                  Các agent AI đang đối chiếu tài liệu đã embed...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(AGENT_LABELS).map(([agent, label]) => (
                  <div
                    key={agent}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{agent}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Kết quả agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.steps.map((step) => (
                    <div
                      key={step.agent}
                      className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {AGENT_LABELS[step.agent] ?? step.agent}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.summary}
                        </p>
                      </div>
                      <Badge
                        variant={
                          step.status === "completed" ? "default" : "outline"
                        }
                      >
                        {step.status === "completed"
                          ? "Hoàn tất"
                          : step.status}
                      </Badge>
                    </div>
                  ))}

                  {result.documentContext && result.documentContext.length > 0 && (
                    <div className="rounded-lg border bg-background/60 p-3 text-xs">
                      <p className="font-medium">Loại văn bản đã nhận diện</p>
                      <ul className="mt-2 space-y-2 text-muted-foreground">
                        {result.documentContext.map((item) => (
                          <li key={`${item.role}-${item.filename}`}>
                            <span className="font-medium text-foreground">
                              {item.role === "source" ? "Gốc" : "Tham khảo"}:
                            </span>{" "}
                            {item.documentType}
                            {item.titleOrSubject
                              ? ` — ${item.titleOrSubject}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.plan && (
                    <div className="rounded-lg border bg-background/60 p-3 text-xs">
                      <p className="font-medium">Trọng tâm đối chiếu</p>
                      <p className="mt-1 text-muted-foreground">
                        {result.plan.focusAreas.join(" · ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4 text-primary" />
                    Báo cáo đối chiếu
                  </CardTitle>
                  <CardDescription>
                    Gốc: {result.sourceDocument.filename}
                    {" · "}
                    Tham khảo:{" "}
                    {result.referenceDocuments
                      .map((document) => document.filename)
                      .join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MarkdownMessage
                    content={result.report}
                    variant="compare-report"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </SidebarInset>
  );
}
