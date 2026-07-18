import { describe, expect, it } from "vitest";
import { DemoRepository } from "./demo-repository";

describe("DemoRepository Messaging", () => {
  it("fetches default chat threads", async () => {
    const repo = new DemoRepository();
    const threads = await repo.getChatThreads();
    expect(threads).toBeDefined();
    expect(threads.length).toBeGreaterThanOrEqual(3);
    const maria = threads.find((t) => t.id === "maria");
    expect(maria?.name).toBe("Мария");
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
});
