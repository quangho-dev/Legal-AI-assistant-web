"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Loader2, Scale, SendHorizontal, Sparkles } from "lucide-react";

import { sendChatMessage } from "@/lib/api/chat";
import {
  buildChatTitle,
  LEGAL_STARTER_PROMPTS,
} from "@/lib/chat-utils";
import type { ChatMessage, ChatSession } from "@/lib/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatPanelProps = {
  chat: ChatSession;
  onUpdateChat: (chat: ChatSession) => void;
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="mt-1 size-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Scale className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[85%] space-y-2 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-card-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.citations.map((citation, index) => (
              <Badge key={`${message.id}-citation-${index}`} variant="secondary">
                {citation.filename ?? `Nguồn ${index + 1}`}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="mt-1 size-8 shrink-0">
          <AvatarFallback>Bạn</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <Avatar className="mt-1 size-8 shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Scale className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang tra cứu nguồn pháp lý…
      </div>
    </div>
  );
}

export function ChatPanel({ chat, onUpdateChat }: ChatPanelProps) {
  const { getToken } = useAuth();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, isLoading]);

  async function handleSendMessage(messageText: string) {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const optimisticChat: ChatSession = {
      ...chat,
      title:
        chat.messages.length === 0 ? buildChatTitle(trimmed) : chat.title,
      messages: [...chat.messages, userMessage],
      updatedAt: new Date().toISOString(),
    };

    onUpdateChat(optimisticChat);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getToken();
      const response = await sendChatMessage(
        { chatId: chat.id, message: trimmed },
        token
      );

      onUpdateChat({
        ...optimisticChat,
        title: response.chatTitle ?? optimisticChat.title,
        messages: [...optimisticChat.messages, response.message],
        updatedAt: new Date().toISOString(),
      });
    } catch {
      onUpdateChat({
        ...optimisticChat,
        messages: optimisticChat.messages.filter(
          (message) => message.id !== userMessage.id
        ),
      });
      toast.error("Không thể kết nối với trợ lý pháp lý. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSendMessage(input);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage(input);
    }
  }

  return (
    <SidebarInset className="h-svh overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{chat.title}</h1>
          <p className="truncate text-xs text-muted-foreground">
            Đặt câu hỏi về tài liệu pháp lý và án lệ
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="flex-1 px-4 py-6">
          {chat.messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 pt-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Trợ lý nghiên cứu pháp lý
                </h2>
                <p className="text-sm text-muted-foreground">
                  Nhận câu trả lời dựa trên tài liệu pháp lý đã tải lên của bạn
                  bằng công nghệ RAG (tạo sinh tăng cường truy xuất).
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {LEGAL_STARTER_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    className="h-auto min-h-16 justify-start whitespace-normal px-4 py-3 text-left text-sm"
                    onClick={() => void handleSendMessage(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {chat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t bg-background/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Đặt câu hỏi pháp lý…"
              className="min-h-[52px] max-h-40 resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon-lg"
              disabled={!input.trim() || isLoading}
              aria-label="Gửi tin nhắn"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SendHorizontal className="size-4" />
              )}
            </Button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
            Câu trả lời chỉ mang tính chất tham khảo và không cấu thành tư vấn
            pháp lý.
          </p>
        </div>
      </div>
    </SidebarInset>
  );
}
