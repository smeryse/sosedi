"use server";

import { requireUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

interface ProfileRecord {
  id: string;
  display_name?: string | null;
  age?: number | null;
  job_title?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  city?: string | null;
  profile_preferences?: Record<string, unknown> & {
    districts?: string[] | null;
    smoking?: string | null;
    pets?: string | null;
    sleep_schedule?: string | null;
    noise_tolerance?: number | null;
    guests_frequency?: string | null;
    remote_work?: string | null;
    cleanliness?: number | null;
    sociability?: number | null;
    private_space?: number | null;
  } | null;
  lifestyle_answers?: Array<{
    question_key: string;
    answer: unknown;
    importance?: number | null;
  }> | null;
}

interface CompatibilityFactor {
  criterion: string;
  userValue: string;
  targetValue: string;
  weight: number;
  score: number;
  explanation: string;
}

export async function calculateCompatibility(targetId: string): Promise<{
  overall: number;
  factors: CompatibilityFactor[];
  summary: string;
}> {
  const user = await requireUser();

  if (user.id === targetId) {
    return { overall: 100, factors: [], summary: "Это ваш профиль" };
  }

  const profiles = await query<ProfileRecord & Record<string, unknown>>(
    `select p.id, p.display_name, p.age, p.job_title, p.budget_min, p.budget_max, p.city,
            coalesce(to_jsonb(pp) - 'profile_id', '{}'::jsonb) as profile_preferences,
            coalesce(answers.items, '[]'::jsonb) as lifestyle_answers
       from profiles p
       join users u on u.id = p.id and u.disabled_at is null
       left join profile_preferences pp on pp.profile_id = p.id
       left join lateral (
         select jsonb_agg(jsonb_build_object('question_key', la.question_key,
           'answer', la.answer, 'importance', la.importance)) as items
         from lifestyle_answers la where la.profile_id = p.id
       ) answers on true
      where p.id = any($1::uuid[]) and (p.id = $2 or p.is_public = true)`,
    [[user.id, targetId], user.id],
  );
  const me = profiles.rows.find((profile) => profile.id === user.id);
  const target = profiles.rows.find((profile) => profile.id === targetId);

  if (!me || !target) throw new Error("Профиль не найден");

  const myProfile = me as unknown as ProfileRecord;
  const targetProfile = target as unknown as ProfileRecord;

  const factors: CompatibilityFactor[] = [];

  // 1. Budget compatibility (weight: 25%)
  const budgetScore = calculateBudgetCompatibility(myProfile, targetProfile);
  factors.push({
    criterion: "Бюджет",
    userValue: `${myProfile.budget_min || 0}–${myProfile.budget_max || 0} ₽`,
    targetValue: `${targetProfile.budget_min || 0}–${targetProfile.budget_max || 0} ₽`,
    weight: 0.25,
    score: budgetScore,
    explanation: budgetScore > 80 ? "Бюджеты почти совпадают" :
      budgetScore > 50 ? "Бюджеты близки" : "Большая разница в бюджете",
  });

  // 2. Lifestyle preferences (weight: 35%)
  const prefScore = calculatePreferencesCompatibility(myProfile, targetProfile);
  factors.push({
    criterion: "Образ жизни",
    userValue: "Ваши предпочтения",
    targetValue: "Предпочтения соседа",
    weight: 0.35,
    score: prefScore,
    explanation: getPreferenceExplanation(prefScore),
  });

  // 3. Lifestyle answers (weight: 25%)
  const answerScore = calculateAnswersCompatibility(myProfile, targetProfile);
  factors.push({
    criterion: "Анкета",
    userValue: "Ваши ответы",
    targetValue: "Ответы соседа",
    weight: 0.25,
    score: answerScore,
    explanation: answerScore > 70 ? "Ответы в анкете очень близки" :
      answerScore > 40 ? "Много общих ответов" : "Разные ответы в анкете",
  });

  // 4. Location/district (weight: 15%)
  const locationScore = calculateLocationCompatibility(myProfile, targetProfile);
  factors.push({
    criterion: "Район",
    userValue: myProfile.profile_preferences?.districts?.join(", ") || "Любой",
    targetValue: targetProfile.city || "Не указан",
    weight: 0.15,
    score: locationScore,
    explanation: locationScore > 80 ? "Предпочитаете одни районы" :
      locationScore > 50 ? "Районы близки" : "Разные предпочтения по районам",
  });

  // Calculate weighted average
  const overall = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  const summary = generateSummary(overall, factors);

  return { overall, factors, summary };
}

function calculateBudgetCompatibility(me: ProfileRecord, target: ProfileRecord): number {
  const myMin = me.budget_min || 0;
  const myMax = me.budget_max || 100000;
  const theirMin = target.budget_min || 0;
  const theirMax = target.budget_max || 100000;

  // Check overlap
  const overlapMin = Math.max(myMin, theirMin);
  const overlapMax = Math.min(myMax, theirMax);

  if (overlapMin > overlapMax) return 0; // No overlap

  const overlap = overlapMax - overlapMin;
  const myRange = myMax - myMin;
  const theirRange = theirMax - theirMin;

  // Score based on overlap percentage of both ranges
  const myOverlapPct = myRange > 0 ? (overlap / myRange) : 1;
  const theirOverlapPct = theirRange > 0 ? (overlap / theirRange) : 1;

  return Math.round((myOverlapPct + theirOverlapPct) / 2 * 100);
}

function calculatePreferencesCompatibility(me: ProfileRecord, target: ProfileRecord): number {
  const prefs = [
    { key: "smoking", weight: 15 },
    { key: "pets", weight: 15 },
    { key: "sleep_schedule", weight: 20 },
    { key: "noise_tolerance", weight: 15 },
    { key: "guests_frequency", weight: 10 },
    { key: "remote_work", weight: 10 },
    { key: "cleanliness", weight: 15 },
    { key: "sociability", weight: 5 },
    { key: "private_space", weight: 5 },
  ];

  let totalScore = 0;
  let totalWeight = 0;

  for (const { key, weight } of prefs) {
    const myVal = me.profile_preferences?.[key];
    const theirVal = target.profile_preferences?.[key];

    if (myVal === undefined || theirVal === undefined) continue;

    let score = 0;
    if (typeof myVal === "number" && typeof theirVal === "number") {
      // Numeric scales (1-5)
      const diff = Math.abs(myVal - theirVal);
      score = Math.max(0, 100 - diff * 20);
    } else if (myVal === theirVal) {
      score = 100;
    } else if (typeof myVal === "string" && typeof theirVal === "string") {
      // Categorical: check if compatible
      const compatible = areCompatible(myVal, theirVal, key);
      score = compatible ? 80 : 20;
    }

    totalScore += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
}

function areCompatible(a: string, b: string, key: string): boolean {
  // Smoking: no vs sometimes/yes = bad
  if (key === "smoking") {
    const noSmoke = ["no", "indifferent"];
    return noSmoke.includes(a) && noSmoke.includes(b) || a === b;
  }
  // Pets: cat/dog vs no = potential issue
  if (key === "pets") {
    const noPets = ["no", "indifferent"];
    return noPets.includes(a) && noPets.includes(b) || a === b;
  }
  // Sleep schedule: early vs late = conflict
  if (key === "sleep_schedule") {
    return a === b || a === "flexible" || b === "flexible";
  }
  return a === b;
}

function calculateAnswersCompatibility(me: ProfileRecord, target: ProfileRecord): number {
  const myAnswers = me.lifestyle_answers || [];
  const theirAnswers = target.lifestyle_answers || [];

  if (!myAnswers.length || !theirAnswers.length) return 50;

  // Match by question_key
  const theirMap = new Map(theirAnswers.map((a) => [a.question_key, a]));

  let totalScore = 0;
  let count = 0;

  for (const myAnswer of myAnswers) {
    const theirAnswer = theirMap.get(myAnswer.question_key);
    if (!theirAnswer) continue;

    // Compare answers
    let score = 0;
    const myVal = myAnswer.answer;
    const theirVal = theirAnswer.answer;

    if (typeof myVal === "boolean" && typeof theirVal === "boolean") {
      score = myVal === theirVal ? 100 : 0;
    } else if (typeof myVal === "string" && typeof theirVal === "string") {
      score = myVal.toLowerCase() === theirVal.toLowerCase() ? 100 : 30;
    } else if (typeof myVal === "number" && typeof theirVal === "number") {
      const diff = Math.abs(myVal - theirVal);
      score = Math.max(0, 100 - diff * 10);
    } else {
      score = 50;
    }

    // Weight by importance
    const importance = (myAnswer.importance || 3) + (theirAnswer.importance || 3);
    totalScore += score * importance;
    count += importance;
  }

  return count > 0 ? Math.round(totalScore / count) : 50;
}

function calculateLocationCompatibility(me: ProfileRecord, target: ProfileRecord): number {
  const myDistricts = me.profile_preferences?.districts || [];
  const theirCity = target.city || "";

  if (!myDistricts.length) return 70; // No preference
  if (!theirCity) return 50;

  // Check if their city matches any preferred district
  const match = myDistricts.some((d: string) =>
    theirCity.toLowerCase().includes(d.toLowerCase()) ||
    d.toLowerCase().includes(theirCity.toLowerCase())
  );

  return match ? 90 : 40;
}

function getPreferenceExplanation(score: number): string {
  if (score > 80) return "Предпочтения почти идеально совпадают";
  if (score > 60) return "Много общих предпочтений";
  if (score > 40) return "Есть различия в привычках";
  return "Кардинально разные подходы к быту";
}

function generateSummary(overall: number, factors: CompatibilityFactor[]): string {
  if (overall >= 90) return "Идеальное совпадение! Вы почти идеально подходите друг другу.";
  if (overall >= 80) return "Отличная совместимость. Много общего в быту и бюджете.";
  if (overall >= 70) return "Хорошая совместимость. Есть различия, но их можно обсудить.";
  if (overall >= 60) return "Средняя совместимость. Есть существенные различия, требующие обсуждения.";
  if (overall >= 50) return "Низкая совместимость. Много различий в быту и привычках.";
  return "Совместимость низкая. Рекомендуем поиск других вариантов.";
}

export async function getTopMatches(limit = 10) {
  const user = await requireUser();
  const safeLimit = Math.min(50, Math.max(1, limit));
  const profiles = await query<{ id: string; display_name: string; avatar_path: string | null } & Record<string, unknown>>(
    `select p.id, p.display_name, p.avatar_path from profiles p
     join users u on u.id = p.id and u.disabled_at is null
     where p.is_public = true and p.id <> $1
       and not exists (
         select 1 from blocked_users b
          where (b.blocker_id = $1 and b.blocked_id = p.id)
             or (b.blocker_id = p.id and b.blocked_id = $1)
       )
     order by p.updated_at desc limit $2`,
    [user.id, safeLimit * 3],
  );

  // Calculate compatibility for each
  const matches = await Promise.all(
    profiles.rows.slice(0, safeLimit).map(async (p) => {
      const { overall, factors } = await calculateCompatibility(p.id);
      return { ...p, compatibility: overall, factors };
    })
  );

  return matches.sort((a, b) => b.compatibility - a.compatibility);
}
