"use server";

import { getRepository } from "@/lib/repositories/server";
import type { Repository } from "@/lib/repositories/types";
import type {
  ChatMessageType,
  DemoAnswer,
  DemoApplication,
  DemoGroup,
  ExpenseShare,
  ExpenseSplit,
  GroupPoll,
  MessageAttachment,
  PropertyFilters,
  ViewingBooking,
} from "@/lib/repositories/types";

type ActionResult<T> = { data: T; error: string | null };

async function run<T>(operation: (repository: Repository) => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { data: await operation(getRepository()), error: null };
  } catch (error) {
    return {
      data: undefined as T,
      error: error instanceof Error ? error.message : "Не удалось выполнить операцию",
    };
  }
}

export async function listRoommates(query = "") {
  return run((repository) => repository.listRoommates(query));
}

export async function listProperties(filters: PropertyFilters = {}) {
  return run((repository) => repository.listProperties(filters));
}

export async function getState() {
  return run((repository) => repository.getState());
}

export async function toggleFavorite(type: "profile" | "property", id: string) {
  return run((repository) => repository.toggleFavorite(type, id));
}

export async function saveAnswer(answer: DemoAnswer) {
  return run((repository) => repository.saveAnswer(answer));
}

export async function createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">) {
  return run((repository) => repository.createGroup(input));
}

export async function submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId">) {
  return run((repository) => repository.submitApplication(input));
}

export async function getChatThreads() {
  return run((repository) => repository.getChatThreads());
}

export async function getMessages(threadId: string) {
  return run((repository) => repository.getMessages(threadId));
}

export async function sendMessage(
  threadId: string,
  content: string,
  type: ChatMessageType = "text",
  extraData?: {
    propertyId?: string;
    viewingData?: ViewingBooking;
    pollData?: GroupPoll;
    expenseData?: ExpenseSplit;
    voiceDuration?: string;
    attachments?: MessageAttachment[];
  },
) {
  return run((repository) => repository.sendMessage(threadId, content, type, extraData));
}

export async function markThreadAsRead(threadId: string) {
  return run(async (repository) => {
    await repository.markThreadAsRead(threadId);
    return true;
  });
}

export async function voteInPoll(threadId: string, messageId: string, optionId: string) {
  return run((repository) => repository.voteInPoll(threadId, messageId, optionId));
}

export async function updateViewingStatus(
  threadId: string,
  messageId: string,
  status: ViewingBooking["status"],
) {
  return run((repository) => repository.updateViewingStatus(threadId, messageId, status));
}

export async function toggleExpensePaid(threadId: string, messageId: string, memberId: string) {
  return run((repository) => repository.toggleExpensePaid(threadId, messageId, memberId));
}

export async function togglePinThread(threadId: string) {
  return run((repository) => repository.togglePinThread(threadId));
}

export async function toggleMessageReaction(threadId: string, messageId: string, emoji: string) {
  return run((repository) => repository.toggleMessageReaction(threadId, messageId, emoji));
}

export async function listChores() {
  return run((repository) => repository.listChores());
}

export async function createChore(title: string, assigneeId: string, dueDate: string) {
  return run((repository) => repository.createChore(title, assigneeId, dueDate));
}

export async function toggleChoreDone(id: string) {
  return run((repository) => repository.toggleChoreDone(id));
}

export async function listExpenses() {
  return run((repository) => repository.listExpenses());
}

export async function createExpense(title: string, totalAmount: number, shares: ExpenseShare[]) {
  return run((repository) => repository.createExpense(title, totalAmount, shares));
}

export async function toggleGlobalExpensePaid(expenseId: string, memberId: string) {
  return run((repository) => repository.toggleGlobalExpensePaid(expenseId, memberId));
}
