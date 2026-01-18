export type RecommendationType =
  | "return"
  | "exchange"
  | "track"
  | "contact_support"
  | "deadline_warning"
  | "delivery_update";

export type Urgency = "low" | "medium" | "high" | "critical";

export type RecommendationStatus =
  | "pending"
  | "viewed"
  | "acted"
  | "dismissed"
  | "expired";

export interface RecommendationAction {
  label: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface AgentRecommendation {
  id: string;
  userId: string;
  orderId?: string;
  type: RecommendationType;
  title: string;
  description: string;
  reasoning?: string;
  urgency: Urgency;
  primaryAction?: RecommendationAction;
  secondaryAction?: RecommendationAction;
  status: RecommendationStatus;
  expiresAt?: string;
  userAction?: string;
  actedAt?: string;
  createdAt: string;
}

export type MessageRole = "user" | "agent" | "system";

export interface MessageAction {
  label: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface MessageAttachment {
  type: "image" | "file";
  url: string;
  name?: string;
}

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  actions?: MessageAction[];
  attachments?: MessageAttachment[];
  createdAt: string;
}

export interface AgentConversation {
  id: string;
  userId: string;
  title?: string;
  context?: Record<string, unknown>;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  recommendationId?: string;
  type: string;
  title: string;
  body: string;
  channels: ("in_app" | "email")[];
  read: boolean;
  readAt?: string;
  createdAt: string;
}
