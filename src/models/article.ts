export interface Article {
  title: string;
  content: string;
  url: string;
  date: string;
  embedding?: number[];
}

export interface AgentResponse {
  answer: string;
  sources: {
    title: string;
    url: string;
    date: string;
  }[];
}

export interface AgentRequest {
  query: string;
}