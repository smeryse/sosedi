import { describe, expect, it } from "vitest";
import { analyzeChatHarmony } from "./chat-analysis-service";
import type { ChatMessage } from "@/lib/repositories/types";

describe("chat-analysis-service", () => {
  it("returns not_analyzed when message count < 2", () => {
    const res = analyzeChatHarmony("chat-1", []);
    expect(res.status).toBe("not_analyzed");
    expect(res.harmonyScore).toBeNull();
    expect(res.recommendations).toHaveLength(0);
  });

  it("calculates harmony and threat level deterministically with recommendations", () => {
    const mockMessages: ChatMessage[] = [
      {
        id: "m1",
        senderId: "u1",
        senderName: "Анна",
        senderAvatar: "/demo/people/anna.svg",
        content: "Здравствуйте! Подскажите, когда можно посмотреть квартиру?",
        timestamp: "12:00",
        type: "text",
      },
      {
        id: "m2",
        senderId: "u2",
        senderName: "Собственник",
        senderAvatar: "/demo/people/owner.svg",
        content: "Здравствуйте! В четверг в 18:30 отличный вариант.",
        timestamp: "12:05",
        type: "text",
      },
    ];

    const res = analyzeChatHarmony("chat-owner", mockMessages);
    expect(res.status).toBe("analyzed");
    expect(res.harmonyScore).toBeGreaterThan(70);
    expect(res.source).toBe("rule_engine");
    expect(res.recommendations.length).toBeGreaterThan(0);
    expect(res.recommendations[0].chatId).toBe("chat-owner");
    expect(res.recommendations[0].suggestedMessage).toBeDefined();
  });
});
