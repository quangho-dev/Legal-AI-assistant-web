export type MessageRole = "user" | "assistant";

export type Citation = {
  chunkId?: string;
  documentId?: string;
  filename?: string;
  lawName?: string;
  section?: string;
  sectionName?: string;
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

export type DocumentContent = {
  documentId: string;
  filename: string;
  sections: {
    chunkIndex: number;
    pageNumber?: number | null;
    text: string;
  }[];
  fullText: string;
};

export type ChunkContent = {
  chunkId: string;
  documentId: string;
  filename: string;
  chunkIndex?: number | null;
  pageNumber?: number | null;
  lawName?: string;
  section?: string;
  sectionName?: string;
  text: string;
};

export type SendChatMessageResponse = {
  message: ChatMessage;
  chatTitle?: string;
};
