"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { ChevronDown, FileText, Loader2 } from "lucide-react";

import { getChunkContent } from "@/lib/api/documents";
import {
  displayCitationValue,
  formatLawDisplayName,
} from "@/lib/chat-utils";
import type { Citation } from "@/lib/types/chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CitationListProps = {
  citations: Citation[];
};

export function CitationList({ citations }: CitationListProps) {
  return (
    <div className="space-y-2 pt-1">
      {citations.map((citation, index) => (
        <CitationItem
          key={`citation-${index}`}
          citation={citation}
        />
      ))}
    </div>
  );
}

function CitationField({
  label,
  value,
  stacked = false,
  emphasized = false,
}: {
  label: string;
  value: string;
  stacked?: boolean;
  emphasized?: boolean;
}) {
  if (stacked) {
    return (
      <div className="min-w-0">
        <span className="text-muted-foreground">{label}</span>
        <p
          className={cn(
            "break-words text-foreground",
            emphasized && "font-medium"
          )}
        >
          {value}
        </p>
      </div>
    );
  }

  return (
    <p className="min-w-0 break-words">
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground">{value}</span>
    </p>
  );
}

function CitationDetails({ citation }: { citation: Citation }) {
  return (
    <div className="min-w-0 flex-1 space-y-0.5 text-xs">
      <CitationField
        label="Văn bản"
        value={formatLawDisplayName(citation)}
        stacked
        emphasized
      />
      <CitationField
        label="Điều khoản"
        value={displayCitationValue(citation.section)}
      />
      <CitationField
        label="Tên điều khoản"
        value={displayCitationValue(citation.sectionName)}
        stacked
      />
    </div>
  );
}

function CitationItem({ citation }: { citation: Citation }) {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Citation>(citation);

  useEffect(() => {
    setMetadata(citation);
    setContent(null);
    setIsOpen(false);
  }, [citation.chunkId]);

  const loadChunkContent = useCallback(async () => {
    if (!citation.chunkId) {
      throw new Error("Không thể mở đoạn trích dẫn này");
    }

    const token = await getToken();
    const chunk = await getChunkContent(citation.chunkId, token);
    const text = chunk.text?.trim() || "Không có nội dung để hiển thị.";

    setContent(text);
    setMetadata({
      ...citation,
      lawName: chunk.lawName ?? citation.lawName,
      section: chunk.section ?? citation.section,
      sectionName: chunk.sectionName ?? citation.sectionName,
    });

    return text;
  }, [citation, getToken]);

  useEffect(() => {
    if (!citation.chunkId || content !== null) return;

    async function prefetchChunk() {
      try {
        await loadChunkContent();
      } catch {
        // Content will load when the user expands the citation.
      }
    }

    void prefetchChunk();
  }, [citation.chunkId, content, loadChunkContent]);

  async function handleToggle() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (!citation.chunkId) {
      toast.error("Không thể mở đoạn trích dẫn này");
      return;
    }

    setIsOpen(true);

    if (content !== null) return;

    setIsLoading(true);

    try {
      await loadChunkContent();
    } catch (error) {
      setIsOpen(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải nội dung đoạn trích dẫn"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background/60">
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-full min-w-0 items-start justify-between gap-2 whitespace-normal px-3 py-2 text-left font-normal"
        onClick={() => void handleToggle()}
        disabled={!citation.chunkId}
      >
        <span className="flex min-w-0 flex-1 items-start gap-2">
          <FileText className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <CitationDetails citation={metadata} />
        </span>
        {isLoading ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin" />
        ) : (
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        )}
      </Button>

      {isOpen && (
        <div className="border-t px-3 py-3">
          <div className="max-h-80 overflow-y-auto pr-3">
            {isLoading && content === null ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Đang tải nội dung...
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                {content}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
