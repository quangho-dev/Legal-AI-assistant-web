"use client";

import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

import { RetrievalSettingsPanel } from "@/components/admin/retrieval-settings-panel";
import { Button } from "@/components/ui/button";

export function AdminRetrievalSettingsPageClient() {
  return (
    <div className="min-h-svh bg-background">
      <header className="flex h-14 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/chat" aria-label="Quay lại chat">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Scale className="size-4 text-primary" />
          AI Pháp lý · Cài đặt trò chuyện
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-6">
        <RetrievalSettingsPanel />
      </div>
    </div>
  );
}
