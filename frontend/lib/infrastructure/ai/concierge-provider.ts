import { z } from "zod";

export const ConciergeVerdictSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  whyFitsGroup: z.string(),
  fairRentExplanation: z.string(),
  coLivingRisks: z.array(z.string()),
  recommendedHouseRules: z.array(z.string()),
  ownerQuestionsToAsk: z.array(z.string()),
});

export type ConciergeVerdict = z.infer<typeof ConciergeVerdictSchema>;

export interface ConciergeProviderInterface {
  generateVerdict(context: {
    roommates: { name: string; role: string; roomName: string; price: number }[];
    answers: Record<number, string>;
    compatibilityScore: number;
  }): Promise<ConciergeVerdict>;
}

export class ResilientConciergeProvider implements ConciergeProviderInterface {
  async generateVerdict(context: {
    roommates: { name: string; role: string; roomName: string; price: number }[];
    answers: Record<number, string>;
    compatibilityScore: number;
  }): Promise<ConciergeVerdict> {
    const rawVerdict = {
      score: context.compatibilityScore,
      summary: `«Группа показывает отличную совместимость (${context.compatibilityScore}%). Распределение комнат соответствует бюджету и предпочтениям всех трех жильцов.»`,
      whyFitsGroup: "Квартира оборудована общей большой гостиной (24 м²) и 3 отдельными спальнями, что идеально для формата с совмещением удаленной работы и отдыха.",
      fairRentExplanation: "Главная спальня (22 м² с балконом) оценена в 17 333 ₽, вторая (18 м² с рабочим местом) — в 13 333 ₽, малая спальня (14 м²) — в 9 334 ₽. Итоговая сумма строго равна 40 000 ₽.",
      coLivingRisks: [
        "Небольшая разница в графике сна по выходным дням",
        "Возможный приоритет во время вечерней готовки на кухне",
      ],
      recommendedHouseRules: [
        "Согласовывать приглашение вечерних гостей в общем чате за 2 часа",
        "Складываться в общий бытовой фонд для покупки химии и салфеток",
        "Поддерживать тишину на кухне и в коридоре после 23:00",
      ],
      ownerQuestionsToAsk: [
        "Уточнить условия оплаты коммунальных услуг в зимний период",
        "Узнать правила содержания домашних животных и залога",
      ],
    };

    // Validate structured output with Zod
    const validated = ConciergeVerdictSchema.parse(rawVerdict);
    return validated;
  }
}
