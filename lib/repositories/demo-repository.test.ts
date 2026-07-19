import { describe, expect, it } from "vitest";
import { DemoRepository } from "./demo-repository";

describe("DemoRepository Messaging", () => {
  it("keeps the tenant message when an application is submitted", async () => {
    const repo = new DemoRepository();
    const application = await repo.submitApplication({
      propertyId: "center-loft",
      groupId: "demo-group",
      message: "Мы готовы приехать на просмотр в удобное для вас время.",
    });

    expect(application.message).toBe("Мы готовы приехать на просмотр в удобное для вас время.");
  });

  it("fetches default chat threads including AI Assistant", async () => {
    const repo = new DemoRepository();
    const threads = await repo.getChatThreads();
    expect(threads).toBeDefined();
    expect(threads.length).toBeGreaterThanOrEqual(4);
    const aiBot = threads.find((t) => t.id === "ai-assistant");
    expect(aiBot?.name).toContain("Женя");
  });

  it("fetches messages for a thread", async () => {
    const repo = new DemoRepository();
    const messages = await repo.getMessages("maria");
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].senderName).toBe("Мария");
  });

  it("sends a message and updates thread lastMessage", async () => {
    const repo = new DemoRepository();
    const msg = await repo.sendMessage("maria", "Привет, я смогу прийти в 18:30");
    expect(msg.content).toBe("Привет, я смогу прийти в 18:30");

    const messages = await repo.getMessages("maria");
    expect(messages[messages.length - 1].content).toBe("Привет, я смогу прийти в 18:30");

    const threads = await repo.getChatThreads();
    const maria = threads.find((t) => t.id === "maria");
    expect(maria?.lastMessage).toBe("Привет, я смогу прийти в 18:30");
  });

  it("marks a thread as read", async () => {
    const repo = new DemoRepository();
    await repo.markThreadAsRead("maria");
    const threads = await repo.getChatThreads();
    const maria = threads.find((t) => t.id === "maria");
    expect(maria?.unreadCount).toBe(0);
  });

  it("allows voting in group poll", async () => {
    const repo = new DemoRepository();
    const updatedMsg = await repo.voteInPoll("group", "g2", "opt-1");
    expect(updatedMsg.pollData?.options[0].voterIds).toContain("user");
  });

  it("allows updating viewing request status", async () => {
    const repo = new DemoRepository();
    const updatedMsg = await repo.updateViewingStatus("owner", "o2", "confirmed");
    expect(updatedMsg.viewingData?.status).toBe("confirmed");
  });

  it("allows toggling expense payment status", async () => {
    const repo = new DemoRepository();
    const updatedMsg = await repo.toggleExpensePaid("group", "g3", "artem");
    const artemShare = updatedMsg.expenseData?.shares.find((s) => s.memberId === "artem");
    expect(artemShare?.isPaid).toBe(true);
  });

  it("allows adding emoji reactions", async () => {
    const repo = new DemoRepository();
    const updatedMsg = await repo.toggleMessageReaction("maria", "m1", "👍");
    expect(updatedMsg.reactions?.["👍"]).toBeGreaterThan(0);
  });
});
