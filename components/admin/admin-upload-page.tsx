"use client";

import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

import { AdminUploadPanel } from "@/components/admin/admin-upload-panel";
import { Button } from "@/components/ui/button";

export function AdminUploadPageClient() {
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
          AI Pháp lý · Quản trị
        </div>
      </header>
      <AdminUploadPanel />
    </div>
  );
}
