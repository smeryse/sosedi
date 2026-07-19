import type { ChatMessage } from "@/lib/repositories/types";

export interface AIRecommendation {
  id: string;
  chatId: string;
  topic: string;
  title: string;
  suggestedMessage: string;
  source: "rule_engine" | "llm_analysis";
  timestamp: string;
  status: "active" | "applied" | "dismissed";
}

export interface ChatHarmonyAnalysis {
  chatId: string;
  status: "analyzed" | "not_analyzed";
  harmonyScore: number | null;
  frictionThreatScore: number | null;
  frictionLabel: string;
  recommendations: AIRecommendation[];
  source: "rule_engine" | "llm_analysis";
}

export function analyzeChatHarmony(chatId: string, messages: ChatMessage[]): ChatHarmonyAnalysis {
  if (!messages || messages.length < 2) {
    return {
      chatId,
      status: "not_analyzed",
      harmonyScore: null,
      frictionThreatScore: null,
      frictionLabel: "Анализ ещё не выполнен",
      recommendations: [],
      source: "rule_engine",
    };
  }

  let positiveCount = 0;
  let frictionCount = 0;
  const recentMsgs = messages.slice(-15);

  const positiveWords = ["спасибо", "отлично", "супер", "договорились", "хорошо", "поддерживаю", "согласна", "согласен", "👍", "❤️", "✨"];
  const frictionWords = ["проблема", "задержка", "грязно", "предоплата", "шум", "почему", "нет", "не согласен"];

  for (const msg of recentMsgs) {
    const text = (msg.content || "").toLowerCase();
    if (positiveWords.some((w) => text.includes(w))) positiveCount++;
    if (frictionWords.some((w) => text.includes(w))) frictionCount++;
  }

  const baseHarmony = Math.min(98, Math.max(65, 82 + positiveCount * 3 - frictionCount * 6));
  const threatScore = Math.max(2, Math.min(40, 100 - baseHarmony));
  const frictionLabel = threatScore < 15 ? "Низкая" : threatScore < 30 ? "Умеренная" : "Высокая";

  const recommendations: AIRecommendation[] = [];
  const timeStr = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  if (chatId.includes("owner") || messages.some((m) => m.type === "viewing_request")) {
    recommendations.push({
      id: `rec-${chatId}-1`,
      chatId,
      topic: "Просмотр объекта",
      title: "Подтверждение встречи с собственником",
      suggestedMessage: "Здравствуйте! Подтверждаем встречу на просмотр объекта. Наша группа будет вовремя.",
      source: "rule_engine",
      timestamp: timeStr,
      status: "active",
    });
  } else if (chatId.includes("maria") || chatId.includes("roommate")) {
    recommendations.push({
      id: `rec-${chatId}-2`,
      chatId,
      topic: "Бытовой договор",
      title: "Согласование тихих часов и правил",
      suggestedMessage: "Привет! Давай зафиксируем наши тихие часы и правила использования общих зон ☀️",
      source: "rule_engine",
      timestamp: timeStr,
      status: "active",
    });
  } else {
    recommendations.push({
      id: `rec-${chatId}-3`,
      chatId,
      topic: "Совместный бюджет",
      title: "Фиксация распределения залога",
      suggestedMessage: "Привет всей группе! Предлагаю зафиксировать равные доли по залогу в нашем расчёте расходов.",
      source: "rule_engine",
      timestamp: timeStr,
      status: "active",
    });
  }

  return {
    chatId,
    status: "analyzed",
    harmonyScore: baseHarmony,
    frictionThreatScore: threatScore,
    frictionLabel: `${frictionLabel} (${threatScore}%)`,
    recommendations,
    source: "rule_engine",
  };
}
