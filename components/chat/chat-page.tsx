"use client";

import { useMemo, useState } from "react";

import { AppSidebar } from "@/components/chat/app-sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createChatSession } from "@/lib/chat-utils";
import type { ChatSession } from "@/lib/types/chat";

export function ChatPageClient() {
  const initialChat = useMemo(() => createChatSession(), []);
  const [chats, setChats] = useState<ChatSession[]>([initialChat]);
  const [activeChatId, setActiveChatId] = useState(initialChat.id);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? chats[0];

  function handleNewChat() {
    const newChat = createChatSession();
    setChats((current) => [newChat, ...current]);
    setActiveChatId(newChat.id);
  }

  function handleUpdateChat(updatedChat: ChatSession) {
    setChats((current) =>
      current.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        chats={chats}
        activeChatId={activeChat.id}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
      />
      <ChatPanel chat={activeChat} onUpdateChat={handleUpdateChat} />
    </SidebarProvider>
  );
}
