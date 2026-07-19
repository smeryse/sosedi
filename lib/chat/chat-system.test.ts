import { describe, expect, it } from "vitest";
import { AIChatSchema, MessageSendSchema } from "../validators/schemas";

describe("Chat & AI System Contract Tests", () => {
  it("validates incoming AI chat messages via AIChatSchema", () => {
    const validPayload = {
      messages: [
        { role: "user", content: "Как правильно составить договор?" },
        { role: "assistant", content: "Привет! Обратите внимание на залог и акты." },
      ],
    };

    const parsed = AIChatSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.messages).toHaveLength(2);
    }
  });

  it("rejects invalid role or empty content in AIChatSchema", () => {
    const invalidPayload = {
      messages: [
        { role: "unknown_role", content: "" },
      ],
    };

    const parsed = AIChatSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it("validates standard message sending input via MessageSendSchema", () => {
    const validMessage = {
      conversationId: "conv-123",
      content: "Привет сожителям!",
      type: "text",
    };

    const parsed = MessageSendSchema.safeParse(validMessage);
    expect(parsed.success).toBe(true);
  });

  it("prevents sending blank message bodies", () => {
    const invalidMessage = {
      conversationId: "conv-123",
      content: "    ",
      type: "text",
    };

    const parsed = MessageSendSchema.safeParse(invalidMessage);
    expect(parsed.success).toBe(false);
  });
});
