"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

import { AppSidebar } from "@/components/chat/app-sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { createChat, listChats } from "@/lib/api/chat";
import { createChatSession } from "@/lib/chat-utils";
import type { ChatSession } from "@/lib/types/chat";

export function ChatPageClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const fallbackChat = useMemo(() => createChatSession(), []);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadChats = useCallback(async () => {
    if (!isSignedIn) {
      setChats([fallbackChat]);
      setActiveChatId(fallbackChat.id);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();
      const data = await listChats(token);

      if (data.length === 0) {
        const newChat = await createChat(
          { title: "Cuộc trò chuyện mới", id: fallbackChat.id },
          token
        );
        setChats([newChat]);
        setActiveChatId(newChat.id);
      } else {
        setChats(data);
        setActiveChatId(data[0].id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải cuộc trò chuyện"
      );
      setChats([fallbackChat]);
      setActiveChatId(fallbackChat.id);
    } finally {
      setIsLoading(false);
    }
  }, [fallbackChat, getToken, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    void loadChats();
  }, [isLoaded, loadChats]);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? fallbackChat;

  async function handleNewChat() {
    try {
      const token = await getToken();
      const localChat = createChatSession();
      const newChat = await createChat(
        { title: localChat.title, id: localChat.id },
        token
      );
      setChats((current) => [newChat, ...current]);
      setActiveChatId(newChat.id);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tạo cuộc trò chuyện mới"
      );
    }
  }

  function handleUpdateChat(updatedChat: ChatSession) {
    setChats((current) =>
      current.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        chats={chats}
        activeChatId={activeChat.id}
        onSelectChat={setActiveChatId}
        onNewChat={() => void handleNewChat()}
      />
      <ChatPanel chat={activeChat} onUpdateChat={handleUpdateChat} />
    </SidebarProvider>
  );
}
