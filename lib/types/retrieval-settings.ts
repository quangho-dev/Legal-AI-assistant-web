export const RAG_STRATEGIES = [
  "basic",
  "hybrid",
  "multi-query-vector",
  "multi-query-hybrid",
  "corrective-rag",
] as const;



export type RagStrategy = (typeof RAG_STRATEGIES)[number];



export const OPENAI_CHAT_MODELS = [

  "gpt-5.5",

  "gpt-5.5-pro",

  "gpt-5.4",

  "gpt-5.4-pro",

  "gpt-5.4-mini",

  "gpt-5.4-nano",

  "gpt-5.3-codex",

  "gpt-5.2",

  "gpt-5.2-pro",

  "gpt-5.1",

  "gpt-5",

  "gpt-5-mini",

  "gpt-5-nano",

  "gpt-5-pro",

  "o3-pro",

  "o3",

  "o4-mini",

  "o3-mini",

  "o1",

  "o1-mini",

  "gpt-4.1",

  "gpt-4.1-mini",

  "gpt-4.1-nano",

  "gpt-4o",

  "gpt-4o-mini",

  "gpt-4-turbo",

] as const;



export type OpenAIChatModel = (typeof OPENAI_CHAT_MODELS)[number];



export type RetrievalSettings = {

  id: string;

  embedding_model: string;

  chat_model: OpenAIChatModel;

  rag_strategy: RagStrategy;

  agent_type: string;

  chunks_per_search: number;

  final_context_size: number;

  similarity_threshold: number;

  number_of_queries: number;

  reranking_enabled: boolean;

  reranking_model: string;

  vector_weight: number;

  keyword_weight: number;

  created_at?: string;

  updated_at?: string;

};



export type RetrievalSettingsInput = Omit<

  RetrievalSettings,

  "id" | "created_at" | "updated_at"

>;



export const DEFAULT_RETRIEVAL_SETTINGS: RetrievalSettingsInput = {

  embedding_model: "text-embedding-3-small",

  chat_model: "gpt-4o",

  rag_strategy: "hybrid",

  agent_type: "default",

  chunks_per_search: 20,

  final_context_size: 8,

  similarity_threshold: 0.3,

  number_of_queries: 3,

  reranking_enabled: false,

  reranking_model: "cohere-rerank-3",

  vector_weight: 0.7,

  keyword_weight: 0.3,

};



export const RAG_STRATEGY_LABELS: Record<RagStrategy, string> = {
  basic: "Tìm theo nghĩa câu hỏi",
  hybrid: "Kết hợp nghĩa và từ khóa",
  "multi-query-vector": "Tìm nhiều chiều theo nghĩa",
  "multi-query-hybrid": "Tìm nhiều chiều (nghĩa + từ khóa)",
  "corrective-rag": "RAG hiệu chỉnh (đánh giá & lọc kết quả)",
};



export const OPENAI_CHAT_MODEL_LABELS: Record<OpenAIChatModel, string> = {

  "gpt-5.5": "GPT-5.5 (mới nhất)",

  "gpt-5.5-pro": "GPT-5.5 Pro",

  "gpt-5.4": "GPT-5.4",

  "gpt-5.4-pro": "GPT-5.4 Pro",

  "gpt-5.4-mini": "GPT-5.4 mini",

  "gpt-5.4-nano": "GPT-5.4 nano",

  "gpt-5.3-codex": "GPT-5.3 Codex",

  "gpt-5.2": "GPT-5.2",

  "gpt-5.2-pro": "GPT-5.2 Pro",

  "gpt-5.1": "GPT-5.1",

  "gpt-5": "GPT-5",

  "gpt-5-mini": "GPT-5 mini",

  "gpt-5-nano": "GPT-5 nano",

  "gpt-5-pro": "GPT-5 Pro",

  "o3-pro": "o3 Pro",

  o3: "o3",

  "o4-mini": "o4 mini",

  "o3-mini": "o3 mini",

  o1: "o1",

  "o1-mini": "o1 mini",

  "gpt-4.1": "GPT-4.1",

  "gpt-4.1-mini": "GPT-4.1 mini",

  "gpt-4.1-nano": "GPT-4.1 nano",

  "gpt-4o": "GPT-4o",

  "gpt-4o-mini": "GPT-4o mini",

  "gpt-4-turbo": "GPT-4 Turbo",

};



export function isOpenAIChatModel(value: string): value is OpenAIChatModel {

  return OPENAI_CHAT_MODELS.includes(value as OpenAIChatModel);

}


