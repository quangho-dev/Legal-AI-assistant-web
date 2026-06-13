import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ChatPageClient } from "@/components/chat/chat-page";

export default async function ChatPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <ChatPageClient />;
}
