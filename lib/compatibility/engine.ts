import type { CompatibilityProfile, CompatibilityResult } from "./types";

const softWeights = [
  { key: "sleep", label: "Режим сна", weight: 0.14 },
  { key: "noise", label: "Уровень шума", weight: 0.11 },
  { key: "guests", label: "Гости", weight: 0.1 },
  { key: "cleanliness", label: "Чистота", weight: 0.15 },
  { key: "cooking", label: "Готовка", weight: 0.08 },
  { key: "remoteWork", label: "Удалённая работа", weight: 0.1 },
  { key: "temperature", label: "Температура", weight: 0.07 },
  { key: "privateSpace", label: "Личное пространство", weight: 0.08 },
  { key: "sociability", label: "Общительность", weight: 0.09 },
  { key: "leisure", label: "Совместный досуг", weight: 0.08 },
] as const;

function dateDistance(left: string, right: string) {
  const first = new Date(left).getTime();
  const second = new Date(right).getTime();
  return Math.abs(first - second) / 86_400_000;
}

function numberSimilarity(left: number, right: number, max = 4) {
  return Math.max(0, 1 - Math.abs(left - right) / max);
}

function frequencySimilarity(left: string, right: string) {
  const order = ["never", "rarely", "sometimes", "often"];
  return Math.max(0, 1 - Math.abs(order.indexOf(left) - order.indexOf(right)) / 3);
}

function softScore(key: (typeof softWeights)[number]["key"], left: CompatibilityProfile, right: CompatibilityProfile) {
  switch (key) {
    case "sleep":
      return left.sleep === right.sleep ? 1 : left.sleep === "flexible" || right.sleep === "flexible" ? 0.72 : 0.25;
    case "noise":
      return numberSimilarity(left.noise, right.noise);
    case "guests":
      return frequencySimilarity(left.guests, right.guests);
    case "cleanliness":
      return numberSimilarity(left.cleanliness, right.cleanliness);
    case "cooking":
      return numberSimilarity(left.cooking, right.cooking);
    case "remoteWork":
      return frequencySimilarity(left.remoteWork, right.remoteWork);
    case "temperature":
      return numberSimilarity(left.temperature, right.temperature, 5);
    case "privateSpace":
      return numberSimilarity(left.privateSpace, right.privateSpace);
    case "sociability":
      return numberSimilarity(left.sociability, right.sociability);
    case "leisure":
      if (!left.leisure.length || !right.leisure.length) return 0.5;
      return left.leisure.filter((item) => right.leisure.includes(item)).length / Math.max(left.leisure.length, right.leisure.length);
  }
}

export function compatibilityScore(left: CompatibilityProfile, right: CompatibilityProfile): CompatibilityResult {
  const hardConstraints = [
    {
      passed: left.budgetMax >= right.budgetMin && right.budgetMax >= left.budgetMin,
      label: "Бюджет",
      reason: "Бюджеты пересекаются",
    },
    {
      passed: dateDistance(left.moveInDate, right.moveInDate) <= 30,
      label: "Дата въезда",
      reason: "Разница дат въезда не больше 30 дней",
    },
    {
      passed: left.smoking !== "yes" || right.smoking !== "no",
      label: "Курение",
      reason: "Нет критичного конфликта по курению",
    },
    {
      passed: right.smoking !== "yes" || left.smoking !== "no",
      label: "Курение",
      reason: "Нет критичного конфликта по курению",
    },
    {
      passed: left.pets === right.pets || left.pets === "no" || right.pets === "no",
      label: "Животные",
      reason: "Правила по животным можно согласовать",
    },
    {
      passed: Math.min(left.leaseMonths, right.leaseMonths) >= 3,
      label: "Срок аренды",
      reason: "Оба рассматривают срок от 3 месяцев",
    },
    {
      passed: left.districts.length === 0 || right.districts.length === 0 || left.districts.some((district) => right.districts.includes(district)),
      label: "Район",
      reason: "Есть общий приоритетный район",
    },
  ];
  const blockingConflicts = hardConstraints.filter((item) => !item.passed).map((item) => item.label);
  const breakdown = softWeights.map((criterion) => ({
    label: criterion.label,
    score: Math.round(softScore(criterion.key, left, right) * 100),
    weight: criterion.weight,
  }));
  const weightedSoft = breakdown.reduce((sum, item) => sum + item.score * item.weight, 0);
  const hardPenalty = blockingConflicts.length ? Math.min(100, blockingConflicts.length * 28) : 0;
  const score = Math.max(0, Math.round(weightedSoft - hardPenalty));
  const positives = breakdown.filter((item) => item.score >= 80).slice(0, 4).map((item) => `Совпадает: ${item.label.toLowerCase()}`);
  const risks = breakdown.filter((item) => item.score < 60).slice(0, 3).map((item) => `Нужно обсудить: ${item.label.toLowerCase()}`);
  const questions = risks.map((risk) => `Как договоримся про ${risk.replace("Нужно обсудить: ", "")}?`);
  return {
    score,
    confidence: Math.round(Math.max(0.55, 1 - blockingConflicts.length * 0.08) * 100),
    hardConstraints,
    breakdown,
    positives,
    risks,
    blockingConflicts,
    discussionQuestions: questions,
  };
}

export function groupCompatibility(profiles: CompatibilityProfile[]) {
  if (profiles.length < 2 || profiles.length > 4) throw new Error("Группа должна состоять из 2–4 участников.");
  const results: CompatibilityResult[] = [];
  for (let first = 0; first < profiles.length; first += 1) {
    for (let second = first + 1; second < profiles.length; second += 1) {
      results.push(compatibilityScore(profiles[first], profiles[second]));
    }
  }
  const score = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);
  return {
    score,
    minimumPairScore: Math.min(...results.map((result) => result.score)),
    blockingConflicts: [...new Set(results.flatMap((result) => result.blockingConflicts))],
    pairResults: results,
  };
}

export function propertyGroupCompatibility(input: {
  groupBudget: number;
  propertyRent: number;
  groupSize: number;
  rooms: number;
  groupPets: boolean;
  petsAllowed: boolean;
}) {
  const hardConflicts: string[] = [];
  if (input.propertyRent > input.groupBudget) hardConflicts.push("Квартира выше общего бюджета");
  if (input.rooms < input.groupSize) hardConflicts.push("Недостаточно отдельных комнат");
  if (input.groupPets && !input.petsAllowed) hardConflicts.push("Собственник не разрешает животных");
  const budgetScore = Math.max(0, 100 - Math.round(Math.max(0, input.propertyRent - input.groupBudget) / input.groupBudget * 100));
  const roomScore = Math.min(100, Math.round(input.rooms / input.groupSize * 100));
  const score = Math.max(0, Math.round((budgetScore + roomScore + (input.groupPets === input.petsAllowed ? 100 : 0)) / 3 - hardConflicts.length * 25));
  return { score, blockingConflicts: hardConflicts, passed: hardConflicts.length === 0 };
}
