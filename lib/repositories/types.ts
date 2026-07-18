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

export type ViewingBooking = {
  id: string;
  propertyId: string;
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "rescheduled" | "declined";
  requestedBy: string;
};

export type GroupPollOption = {
  id: string;
  text: string;
  voterIds: string[];
};

export type GroupPoll = {
  id: string;
  question: string;
  options: GroupPollOption[];
  totalVotes: number;
};

export type ExpenseShare = {
  memberId: string;
  memberName: string;
  amount: number;
  isPaid: boolean;
};

export type ExpenseSplit = {
  id: string;
  title: string;
  totalAmount: number;
  shares: ExpenseShare[];
};

export type ChatMessageType =
  | "text"
  | "property_card"
  | "system_notice"
  | "attachment"
  | "viewing_request"
  | "poll"
  | "expense_split"
  | "voice"
  | "ai_bot";

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
  reactions?: Record<string, number>;
  userReactions?: string[];
  viewingData?: ViewingBooking;
  pollData?: GroupPoll;
  expenseData?: ExpenseSplit;
  voiceDuration?: string;
};

export type ChatThread = {
  id: string;
  name: string;
  type: "roommate" | "group" | "owner" | "ai_assistant";
  avatar?: string;
  avatars?: string[];
  sublabel?: string;
  propertyId?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
};

export type DemoChore = {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  isDone: boolean;
  dueDate: string;
};

export type DemoState = {
  favorites: { type: "profile" | "property"; id: string }[];
  group: DemoGroup | null;
  applications: DemoApplication[];
  answers: DemoAnswer[];
  threads: ChatThread[];
  messages: Record<string, ChatMessage[]>;
  chores: DemoChore[];
  expenses: ExpenseSplit[];
};

export interface PropertyFilters {
  query?: string;
  city?: string;
  districts?: string[];
  minPrice?: number;
  maxPrice?: number;
  rooms?: number[];
  rentalTerm?: string;
  petsAllowed?: boolean;
  furnished?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "match";
}

export interface Repository {
  listRoommates(query?: string): Promise<DemoRoommate[]>;
  listProperties(filters?: PropertyFilters): Promise<DemoProperty[]>;
  getState(): Promise<DemoState>;
  toggleFavorite(type: "profile" | "property", id: string): Promise<DemoState>;
  saveAnswer(answer: DemoAnswer): Promise<DemoState>;
  createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">): Promise<DemoGroup>;
  submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId">): Promise<DemoApplication>;
  getChatThreads(): Promise<ChatThread[]>;
  getMessages(threadId: string): Promise<ChatMessage[]>;
  sendMessage(
    threadId: string,
    content: string,
    type?: ChatMessageType,
    extraData?: {
      propertyId?: string;
      viewingData?: ViewingBooking;
      pollData?: GroupPoll;
      expenseData?: ExpenseSplit;
      voiceDuration?: string;
      senderId?: string;
      senderName?: string;
      senderAvatar?: string;
    }
  ): Promise<ChatMessage>;
  markThreadAsRead(threadId: string): Promise<void>;
  voteInPoll(threadId: string, messageId: string, optionId: string): Promise<ChatMessage>;
  updateViewingStatus(threadId: string, messageId: string, status: ViewingBooking["status"]): Promise<ChatMessage>;
  toggleExpensePaid(threadId: string, messageId: string, memberId: string): Promise<ChatMessage>;
  togglePinThread(threadId: string): Promise<ChatThread[]>;
  toggleMessageReaction(threadId: string, messageId: string, emoji: string): Promise<ChatMessage>;
  
  // New interactive methods
  listChores(): Promise<DemoChore[]>;
  createChore(title: string, assigneeId: string, dueDate: string): Promise<DemoChore[]>;
  toggleChoreDone(id: string): Promise<DemoChore[]>;
  listExpenses(): Promise<ExpenseSplit[]>;
  createExpense(title: string, totalAmount: number, shares: ExpenseShare[]): Promise<ExpenseSplit[]>;
  toggleGlobalExpensePaid(expenseId: string, memberId: string): Promise<ExpenseSplit[]>;
}
