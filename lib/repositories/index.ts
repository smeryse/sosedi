/**
 * Repository Pattern - Clean DI for Server/Client separation
 *
 * IMPORTANT:
 * - Server Components/Actions: import `getRepository` from `./server`
 * - Client Components: use `createClientRepository()` from this module
 * - Demo Mode: Set `NEXT_PUBLIC_SUPABASE_URL=demo` or leave unset to use DemoRepository
 */

import { isDemoMode } from "@/lib/utils";
import { DemoRepository } from "./demo-repository";
import type { Repository } from "./types";

// Client-side repository factory
let clientRepositoryInstance: Repository | null = null;

/**
 * Create a client-side repository.
 * Uses Server Actions for all operations.
 * In demo mode, uses DemoRepository with localStorage.
 */
export function createClientRepository(): Repository {
  if (clientRepositoryInstance) {
    return clientRepositoryInstance;
  }

  if (typeof window === "undefined") {
    throw new Error("createClientRepository() can only be called in the browser");
  }

  if (isDemoMode()) {
    clientRepositoryInstance = new DemoRepository();
  } else {
    clientRepositoryInstance = new ClientActionRepository();
  }

  return clientRepositoryInstance;
}

/**
 * Client-side repository that delegates to Server Actions.
 * All mutations go through Server Actions for security and validation.
 */
class ClientActionRepository implements Repository {
  private async callAction<T>(
    action: () => Promise<{ data: T; error: string | null }>,
    errorMessage: string
  ): Promise<T> {
    const result = await action();
    if (result.error) {
      throw new Error(result.error || errorMessage);
    }
    return result.data;
  }

  async listRoommates(query = ""): Promise<import("./types").DemoRoommate[]> {
    return this.callAction(
      async () => {
        const { listRoommates } = await import("@/app/actions/repository");
        return listRoommates(query);
      },
      "Не удалось загрузить каталог соседей"
    );
  }

  async listProperties(filters: import("./types").PropertyFilters = {}): Promise<import("./types").DemoProperty[]> {
    return this.callAction(
      async () => {
        const { listProperties } = await import("@/app/actions/repository");
        return listProperties(filters);
      },
      "Не удалось загрузить каталог жилья"
    );
  }

  async getState(): Promise<import("./types").DemoState> {
    return this.callAction(
      async () => {
        const { getState } = await import("@/app/actions/repository");
        return getState();
      },
      "Не удалось загрузить состояние приложения"
    );
  }

  async toggleFavorite(
    type: "profile" | "property",
    id: string
  ): Promise<import("./types").DemoState> {
    return this.callAction(
      async () => {
        const { toggleFavorite } = await import("@/app/actions/repository");
        return toggleFavorite(type, id);
      },
      "Не удалось обновить избранное"
    );
  }

  async saveAnswer(answer: import("./types").DemoAnswer): Promise<import("./types").DemoState> {
    return this.callAction(
      async () => {
        const { saveAnswer } = await import("@/app/actions/repository");
        return saveAnswer(answer);
      },
      "Не удалось сохранить ответ"
    );
  }

  async createGroup(input: Pick<import("./types").DemoGroup, "name" | "targetBudget" | "moveInDate">): Promise<import("./types").DemoGroup> {
    return this.callAction(
      async () => {
        const { createGroup } = await import("@/app/actions/repository");
        return createGroup(input);
      },
      "Не удалось создать группу"
    );
  }

  async submitApplication(input: Pick<import("./types").DemoApplication, "propertyId" | "groupId" | "message">): Promise<import("./types").DemoApplication> {
    return this.callAction(
      async () => {
        const { submitApplication } = await import("@/app/actions/repository");
        return submitApplication(input);
      },
      "Не удалось подать заявку"
    );
  }

  async updateApplicationStatus(id: string, status: import("./types").DemoApplication["status"]): Promise<import("./types").DemoApplication> {
    return this.callAction(
      async () => {
        const { updateApplicationStatus } = await import("@/app/actions/repository");
        return updateApplicationStatus(id, status);
      },
      "Не удалось обновить статус заявки"
    );
  }

  async getChatThreads(): Promise<import("./types").ChatThread[]> {
    return this.callAction(
      async () => {
        const { getChatThreads } = await import("@/app/actions/repository");
        return getChatThreads();
      },
      "Не удалось загрузить чаты"
    );
  }

  async getMessages(threadId: string): Promise<import("./types").ChatMessage[]> {
    return this.callAction(
      async () => {
        const { getMessages } = await import("@/app/actions/repository");
        return getMessages(threadId);
      },
      "Не удалось загрузить сообщения"
    );
  }

  async sendMessage(
    threadId: string,
    content: string,
    type: import("./types").ChatMessageType = "text",
    extraData?: {
      propertyId?: string;
      viewingData?: import("./types").ViewingBooking;
      pollData?: import("./types").GroupPoll;
      expenseData?: import("./types").ExpenseSplit;
      voiceDuration?: string;
      attachments?: import("./types").MessageAttachment[];
    }
  ): Promise<import("./types").ChatMessage> {
    return this.callAction(
      async () => {
        const { sendMessage } = await import("@/app/actions/repository");
        return sendMessage(threadId, content, type, extraData);
      },
      "Не удалось отправить сообщение"
    );
  }

  async markThreadAsRead(threadId: string): Promise<void> {
    await this.callAction(
      async () => {
        const { markThreadAsRead } = await import("@/app/actions/repository");
        return markThreadAsRead(threadId);
      },
      "Не удалось отметить чат как прочитанный"
    );
  }

  async voteInPoll(threadId: string, messageId: string, optionId: string): Promise<import("./types").ChatMessage> {
    return this.callAction(
      async () => {
        const { voteInPoll } = await import("@/app/actions/repository");
        return voteInPoll(threadId, messageId, optionId);
      },
      "Не удалось проголосовать"
    );
  }

  async updateViewingStatus(
    threadId: string,
    messageId: string,
    status: import("./types").ViewingBooking["status"]
  ): Promise<import("./types").ChatMessage> {
    return this.callAction(
      async () => {
        const { updateViewingStatus } = await import("@/app/actions/repository");
        return updateViewingStatus(threadId, messageId, status);
      },
      "Не удалось обновить статус просмотра"
    );
  }

  async toggleExpensePaid(
    threadId: string,
    messageId: string,
    memberId: string
  ): Promise<import("./types").ChatMessage> {
    return this.callAction(
      async () => {
        const { toggleExpensePaid } = await import("@/app/actions/repository");
        return toggleExpensePaid(threadId, messageId, memberId);
      },
      "Не удалось обновить оплату"
    );
  }

  async togglePinThread(threadId: string): Promise<import("./types").ChatThread[]> {
    return this.callAction(
      async () => {
        const { togglePinThread } = await import("@/app/actions/repository");
        return togglePinThread(threadId);
      },
      "Не удалось закрепить чат"
    );
  }

  async toggleMessageReaction(
    threadId: string,
    messageId: string,
    emoji: string
  ): Promise<import("./types").ChatMessage> {
    return this.callAction(
      async () => {
        const { toggleMessageReaction } = await import("@/app/actions/repository");
        return toggleMessageReaction(threadId, messageId, emoji);
      },
      "Не удалось добавить реакцию"
    );
  }

  async listChores(): Promise<import("./types").DemoChore[]> {
    return this.callAction(
      async () => {
        const { listChores } = await import("@/app/actions/repository");
        return listChores();
      },
      "Не удалось загрузить дела"
    );
  }

  async createChore(title: string, assigneeId: string, dueDate: string): Promise<import("./types").DemoChore[]> {
    return this.callAction(
      async () => {
        const { createChore } = await import("@/app/actions/repository");
        return createChore(title, assigneeId, dueDate);
      },
      "Не удалось создать дело"
    );
  }

  async toggleChoreDone(id: string): Promise<import("./types").DemoChore[]> {
    return this.callAction(
      async () => {
        const { toggleChoreDone } = await import("@/app/actions/repository");
        return toggleChoreDone(id);
      },
      "Не удалось обновить дело"
    );
  }

  async listExpenses(): Promise<import("./types").ExpenseSplit[]> {
    return this.callAction(
      async () => {
        const { listExpenses } = await import("@/app/actions/repository");
        return listExpenses();
      },
      "Не удалось загрузить расходы"
    );
  }

  async createExpense(title: string, totalAmount: number, shares: import("./types").ExpenseShare[]): Promise<import("./types").ExpenseSplit[]> {
    return this.callAction(
      async () => {
        const { createExpense } = await import("@/app/actions/repository");
        return createExpense(title, totalAmount, shares);
      },
      "Не удалось создать расход"
    );
  }

  async toggleGlobalExpensePaid(expenseId: string, memberId: string): Promise<import("./types").ExpenseSplit[]> {
    return this.callAction(
      async () => {
        const { toggleGlobalExpensePaid } = await import("@/app/actions/repository");
        return toggleGlobalExpensePaid(expenseId, memberId);
      },
      "Не удалось обновить оплату"
    );
  }
}

// Export for testing
export { DemoRepository } from "./demo-repository";
export type { Repository } from "./types";
