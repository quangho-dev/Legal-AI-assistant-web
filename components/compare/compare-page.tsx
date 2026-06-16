"use client";

import { useMemo } from "react";

import { AppSidebar } from "@/components/chat/app-sidebar";
import { ComparePanel } from "@/components/compare/compare-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createChatSession } from "@/lib/chat-utils";

export function ComparePageClient() {
  const fallbackChat = useMemo(() => createChatSession(), []);

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        chats={[]}
        activeChatId={fallbackChat.id}
        onSelectChat={() => undefined}
        onNewChat={() => undefined}
      />
      <ComparePanel />
    </SidebarProvider>
  );
}
