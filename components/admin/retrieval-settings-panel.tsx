"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Loader2, Save, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createRetrievalSettings,
  getRetrievalSettings,
  updateRetrievalSettings,
} from "@/lib/api/retrieval-settings";
import {
  DEFAULT_RETRIEVAL_SETTINGS,
  isOpenAIChatModel,
  OPENAI_CHAT_MODEL_LABELS,
  OPENAI_CHAT_MODELS,
  RAG_STRATEGIES,
  RAG_STRATEGY_LABELS,
  type OpenAIChatModel,
  type RagStrategy,
  type RetrievalSettingsInput,
} from "@/lib/types/retrieval-settings";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30"
);

function toFormState(settings: RetrievalSettingsInput): RetrievalSettingsInput {
  return {
    ...DEFAULT_RETRIEVAL_SETTINGS,
    ...settings,
    chat_model: isOpenAIChatModel(settings.chat_model)
      ? settings.chat_model
      : DEFAULT_RETRIEVAL_SETTINGS.chat_model,
  };
}

export function RetrievalSettingsPanel() {
  const { getToken } = useAuth();
  const [form, setForm] = useState<RetrievalSettingsInput>(
    DEFAULT_RETRIEVAL_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = await getToken();
      const settings = await getRetrievalSettings(token);

      if (settings) {
        setForm(toFormState(settings));
        setHasExistingSettings(true);
      } else {
        setForm(DEFAULT_RETRIEVAL_SETTINGS);
        setHasExistingSettings(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải cài đặt trò chuyện"
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function updateField<K extends keyof RetrievalSettingsInput>(
    key: K,
    value: RetrievalSettingsInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const token = await getToken();

      if (hasExistingSettings) {
        await updateRetrievalSettings(form, token);
        toast.success("Đã cập nhật cài đặt trò chuyện");
      } else {
        await createRetrievalSettings(form, token);
        setHasExistingSettings(true);
        toast.success("Đã lưu cài đặt trò chuyện");
      }

      await loadSettings();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể lưu cài đặt trò chuyện"
      );
    } finally {
      setIsSaving(false);
    }
  }

  const showHybridWeights =
    form.rag_strategy === "hybrid" || form.rag_strategy === "multi-query-hybrid";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings2 className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">
              Cài đặt trò chuyện
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Điều chỉnh cách trợ lý tìm và sử dụng tài liệu pháp lý khi trả lời.
            Chỉ admin mới có quyền thay đổi.
          </p>
        </div>
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {hasExistingSettings ? "Lưu thay đổi" : "Lưu cài đặt"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm tài liệu</CardTitle>
          <CardDescription>
            Chọn cách trợ lý tìm thông tin liên quan trong kho tài liệu của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="rag_strategy">Phương thức tìm kiếm</Label>
            <select
              id="rag_strategy"
              className={selectClassName}
              value={form.rag_strategy}
              onChange={(event) =>
                updateField("rag_strategy", event.target.value as RagStrategy)
              }
            >
              {RAG_STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {RAG_STRATEGY_LABELS[strategy]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chunks_per_search">Số đoạn tài liệu mỗi lần tìm</Label>
            <Input
              id="chunks_per_search"
              type="number"
              min={1}
              max={100}
              value={form.chunks_per_search}
              onChange={(event) =>
                updateField("chunks_per_search", Number(event.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="final_context_size">Số đoạn đưa vào câu trả lời</Label>
            <Input
              id="final_context_size"
              type="number"
              min={1}
              max={50}
              value={form.final_context_size}
              onChange={(event) =>
                updateField("final_context_size", Number(event.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="similarity_threshold">Độ khớp tối thiểu</Label>
            <Input
              id="similarity_threshold"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={form.similarity_threshold}
              onChange={(event) =>
                updateField("similarity_threshold", Number(event.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number_of_queries">Số cách diễn đạt câu hỏi</Label>
            <Input
              id="number_of_queries"
              type="number"
              min={1}
              max={10}
              value={form.number_of_queries}
              onChange={(event) =>
                updateField("number_of_queries", Number(event.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              Giúp tìm chính xác hơn với phương thức tìm nhiều chiều (1–10).
            </p>
          </div>
        </CardContent>
      </Card>

      {showHybridWeights && (
        <Card>
          <CardHeader>
            <CardTitle>Cân bằng tìm kiếm</CardTitle>
            <CardDescription>
              Điều chỉnh mức ưu tiên giữa nghĩa câu hỏi và từ khóa quan trọng.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vector_weight">Ưu tiên theo nghĩa</Label>
              <Input
                id="vector_weight"
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={form.vector_weight}
                onChange={(event) =>
                  updateField("vector_weight", Number(event.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyword_weight">Ưu tiên theo từ khóa</Label>
              <Input
                id="keyword_weight"
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={form.keyword_weight}
                onChange={(event) =>
                  updateField("keyword_weight", Number(event.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mô hình AI</CardTitle>
          <CardDescription>
            Tùy chỉnh mô hình xử lý nội dung và cách sắp xếp kết quả cho trợ lý.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="chat_model">Mô hình tạo câu trả lời (OpenAI)</Label>
            <select
              id="chat_model"
              className={selectClassName}
              value={form.chat_model}
              onChange={(event) =>
                updateField("chat_model", event.target.value as OpenAIChatModel)
              }
            >
              {OPENAI_CHAT_MODELS.map((model) => (
                <option key={model} value={model}>
                  {OPENAI_CHAT_MODEL_LABELS[model]}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Chọn mô hình OpenAI dùng để tạo câu trả lời cuối cùng cho người dùng.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="embedding_model">Mô hình hiểu nội dung</Label>
            <Input
              id="embedding_model"
              value={form.embedding_model}
              onChange={(event) =>
                updateField("embedding_model", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent_type">Kiểu trả lời</Label>
            <Input
              id="agent_type"
              value={form.agent_type}
              onChange={(event) => updateField("agent_type", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reranking_model">Mô hình sắp xếp kết quả</Label>
            <Input
              id="reranking_model"
              value={form.reranking_model}
              onChange={(event) =>
                updateField("reranking_model", event.target.value)
              }
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="reranking_enabled"
              type="checkbox"
              className="size-4 rounded border-input accent-primary"
              checked={form.reranking_enabled}
              onChange={(event) =>
                updateField("reranking_enabled", event.target.checked)
              }
            />
            <Label htmlFor="reranking_enabled">
              Sắp xếp kết quả theo mức liên quan
            </Label>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
