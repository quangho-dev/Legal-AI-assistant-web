"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  MessageSquarePlus,
  MessagesSquare,
  Scale,
  FileText,
  Upload,
  Activity,
} from "lucide-react";

import type { ChatSession } from "@/lib/types/chat";
import { isAdminUser } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type AppSidebarProps = {
  chats: ChatSession[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
};

export function AppSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}: AppSidebarProps) {
  const { user } = useUser();
  const isAdmin = isAdminUser(user);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Trợ lý AI Pháp lý">
              <Link href="/chat">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Scale className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AI Pháp lý</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Trợ lý RAG
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button
          className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={onNewChat}
        >
          <MessageSquarePlus className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            Cuộc trò chuyện mới
          </span>
        </Button>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Cuộc trò chuyện gần đây</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled tooltip="Chưa có cuộc trò chuyện">
                    <MessagesSquare />
                    <span>Chưa có cuộc trò chuyện nào</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      isActive={chat.id === activeChatId}
                      onClick={() => onSelectChat(chat.id)}
                      tooltip={chat.title}
                    >
                      <MessagesSquare />
                      <span>{chat.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Công cụ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Trợ lý hỏi đáp">
                  <Link href="/chat">
                    <FileText />
                    <span>Trợ lý hỏi đáp</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Quản trị tài liệu">
                      <Link href="/admin/upload">
                        <Upload />
                        <span>Tải tài liệu</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Theo dõi embedding">
                      <Link href="/admin/monitor">
                        <Activity />
                        <span>Theo dõi embedding</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
              <UserButton />
              <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
                Tài khoản
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
