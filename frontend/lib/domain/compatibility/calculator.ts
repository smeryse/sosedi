import { GAME_SITUATIONS } from "../../3d-demo-data";

export interface MultiAxisScore {
  overallScore: number;
  axes: {
    sleep: number;
    cleanliness: number;
    guests: number;
    noise: number;
    budget: number;
    boundaries: number;
    social: number;
    chores: number;
  };
  highlights: string[];
  advice: string;
}

/**
 * Pure domain function to calculate multi-axis compatibility score from user simulation answers.
 */
export function calculateMultiAxisCompatibility(
  answers: Record<number, string>
): MultiAxisScore {
  let totalScore = 0;
  let count = 0;

  const axes = {
    sleep: 85,
    cleanliness: 85,
    guests: 85,
    noise: 85,
    budget: 85,
    boundaries: 85,
    social: 85,
    chores: 85,
  };

  const highlights: string[] = [];

  GAME_SITUATIONS.forEach((sit) => {
    const answerId = answers[sit.id];
    const selectedOption = sit.options.find((opt) => opt.id === answerId);
    if (selectedOption) {
      totalScore += selectedOption.impact;
      count += 1;

      // Map answer impact to specific axis
      if (sit.id === 1) {
        axes.cleanliness = selectedOption.impact;
        if (answerId === "schedule") highlights.push("График уборки кухни");
        if (answerId === "write-chat") highlights.push("Вежливый диалог об уборке");
      }
      if (sit.id === 2) {
        axes.guests = selectedOption.impact;
        if (answerId === "warned") highlights.push("Гости по согласованию за 2 часа");
        if (answerId === "against") highlights.push("Строгий тихий режим без гостей");
      }
      if (sit.id === 3) {
        axes.budget = selectedOption.impact;
        if (answerId === "common-budget") highlights.push("Общий фонд бытовых расходов");
      }
      if (sit.id === 4) {
        axes.noise = selectedOption.impact;
        axes.sleep = selectedOption.impact;
        if (answerId === "total-quiet") highlights.push("Гасим свет и звук в 23:00");
      }
      if (sit.id === 5) {
        axes.boundaries = selectedOption.impact;
        if (answerId === "agreed-hours") highlights.push("Уважение к работе в гостиной");
      }
    }
  });

  const overallScore = count > 0 ? Math.round(totalScore / count) : 85;

  let advice = "«Хороший баланс. Вы с соседями легко сможете договориться по ключевым правилам.»";
  if (overallScore >= 92) {
    advice = "«Выдающийся результат! Ваша группа идеально совпадает по бытовым привычкам и уважает чужие границы.»";
  } else if (overallScore >= 85) {
    advice = "«Отличный потенциал совместного проживания. Согласуйте правила гостей и график дежурств до договора.»";
  } else {
    advice = "«У вас разное отношение к тишине и быту. Рекомендуем обсудить все моменты на личной встрече до заселения.»";
  }

  return {
    overallScore,
    axes,
    highlights,
    advice,
  };
}
