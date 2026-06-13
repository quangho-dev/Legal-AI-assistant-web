export type MessageRole = "user" | "assistant";

export type Citation = {
  documentId?: string;
  filename?: string;
  excerpt?: string;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
  createdAt: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type SendChatMessageRequest = {
  chatId: string;
  message: string;
};

export type SendChatMessageResponse = {
  message: ChatMessage;
  chatTitle?: string;
};
