import type { DemoProperty, DemoRoommate } from "@/data/demo";

export type DemoGroup = {
  id: string;
  name: string;
  status: "forming" | "ready" | "application_sent" | "under_review";
  memberIds: string[];
  targetBudget: number;
  moveInDate: string;
  compatibility: number;
};

export type DemoApplication = {
  id: string;
  propertyId: string;
  groupId: string;
  status: "draft" | "submitted" | "reviewing" | "needs_response" | "approved";
  createdAt: string;
};

export type DemoAnswer = {
  questionKey: string;
  answer: string;
  importance: number;
};

export type ChatMessageType = "text" | "property_card" | "system_notice" | "attachment";

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type?: ChatMessageType;
  propertyId?: string;
  attachmentUrl?: string;
  isRead?: boolean;
};

export type ChatThread = {
  id: string;
  name: string;
  type: "roommate" | "group" | "owner";
  avatar?: string;
  avatars?: string[];
  sublabel?: string;
  propertyId?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
};

export type DemoState = {
  favorites: { type: "profile" | "property"; id: string }[];
  group: DemoGroup | null;
  applications: DemoApplication[];
  answers: DemoAnswer[];
  threads: ChatThread[];
  messages: Record<string, ChatMessage[]>;
};

export interface Repository {
  listRoommates(query?: string): Promise<DemoRoommate[]>;
  listProperties(query?: string): Promise<DemoProperty[]>;
  getState(): Promise<DemoState>;
  toggleFavorite(type: "profile" | "property", id: string): Promise<DemoState>;
  saveAnswer(answer: DemoAnswer): Promise<DemoState>;
  createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">): Promise<DemoGroup>;
  submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId">): Promise<DemoApplication>;
  getChatThreads(): Promise<ChatThread[]>;
  getMessages(threadId: string): Promise<ChatMessage[]>;
  sendMessage(threadId: string, content: string, type?: ChatMessageType, propertyId?: string): Promise<ChatMessage>;
  markThreadAsRead(threadId: string): Promise<void>;
}
