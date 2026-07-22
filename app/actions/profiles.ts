"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";
import {
  CompatibilityWeightsSchema,
  LifestyleAnswerSchema,
  ProfilePreferencesSchema,
  ProfileUpdateSchema,
} from "@/lib/validators/schemas";

function refreshProfile(profileId?: string): void {
  revalidatePath("/app/profile");
  revalidatePath("/owner/profile");
  revalidatePath("/app/settings");
  revalidatePath("/app/roommates");
  if (profileId) revalidatePath(`/app/roommates/${profileId}`);
}

export async function getProfile(userId?: string) {
  const current = await getCurrentUser();
  const targetId = userId ?? current?.id;
  if (!targetId) return null;
  const result = await query(
    `select p.*,
            case when p.id = $2 then p.phone else null end as phone,
            coalesce(to_jsonb(pp) - 'profile_id', '{}'::jsonb) as profile_preferences,
            coalesce(answers.items, '[]'::jsonb) as lifestyle_answers,
            coalesce(weights.items, '[]'::jsonb) as compatibility_weights,
            coalesce(roles.items, '[]'::jsonb) as user_roles,
            (u.email_verified_at is not null) as email_verified,
            (p.phone_verified_at is not null) as phone_verified
       from profiles p join users u on u.id = p.id
       left join profile_preferences pp on pp.profile_id = p.id
       left join lateral (
         select jsonb_agg(jsonb_build_object('question_key', a.question_key, 'answer', a.answer,
           'importance', a.importance) order by a.question_key) items
         from lifestyle_answers a where a.profile_id = p.id
       ) answers on true
       left join lateral (
         select jsonb_agg(jsonb_build_object('criterion', w.criterion, 'weight', w.weight)
           order by w.criterion) items from compatibility_weights w where w.profile_id = p.id
       ) weights on true
       left join lateral (
         select jsonb_agg(jsonb_build_object('role', r.role) order by r.role) items
           from user_roles r where r.user_id = p.id
       ) roles on true
      where p.id = $1 and (p.is_public = true or p.id = $2) and u.disabled_at is null`,
    [targetId, current?.id ?? null],
  );
  return result.rows[0] ?? null;
}

export async function updateProfile(updates: {
  display_name?: string;
  age?: number;
  job_title?: string;
  bio?: string;
  city?: string;
  budget_min?: number;
  budget_max?: number;
  move_in_date?: string;
  lease_months?: number;
  avatar_path?: string;
  is_public?: boolean;
}) {
  const user = await requireUser();
  const parsed = ProfileUpdateSchema.safeParse(updates);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте профиль");
  const values: unknown[] = [user.id];
  const assignments: string[] = [];
  const fields = [
    "display_name",
    "age",
    "job_title",
    "bio",
    "city",
    "budget_min",
    "budget_max",
    "move_in_date",
    "lease_months",
    "avatar_path",
    "is_public",
  ] as const;
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(parsed.data, field)) {
      values.push(parsed.data[field] ?? null);
      assignments.push(`${field} = $${values.length}`);
    }
  }
  if (!assignments.length) return getProfile();
  if (
    parsed.data.budget_min !== undefined &&
    parsed.data.budget_max !== undefined &&
    parsed.data.budget_min !== null &&
    parsed.data.budget_max !== null &&
    parsed.data.budget_min > parsed.data.budget_max
  ) {
    throw new Error("Минимальный бюджет не может быть выше максимального");
  }
  const result = await query(
    `update profiles set ${assignments.join(", ")}, updated_at = now() where id = $1 returning *`,
    values,
  );
  refreshProfile(user.id);
  return result.rows[0];
}

export async function updatePreferences(preferences: {
  districts?: string[];
  smoking?: "no" | "sometimes" | "yes" | "indifferent";
  pets?: "no" | "cat" | "dog" | "other" | "indifferent";
  sleep_schedule?: "early" | "late" | "flexible";
  noise_tolerance?: number;
  guests_frequency?: "never" | "rarely" | "sometimes" | "often";
  remote_work?: "never" | "sometimes" | "often";
  cleanliness?: number;
  sociability?: number;
  private_space?: number;
  cooking?: number;
  shared_products?: boolean;
  temperature?: number;
  common_zones?: number;
  leisure?: string[];
  pet_tolerance?: "no" | "cat" | "dog" | "any";
}) {
  const user = await requireUser();
  const current = await query(`select * from profile_preferences where profile_id = $1`, [user.id]);
  const merged = { ...(current.rows[0] ?? {}), ...preferences };
  const parsed = ProfilePreferencesSchema.safeParse(merged);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте предпочтения");
  const p = parsed.data;
  const result = await query(
    `insert into profile_preferences
      (profile_id, districts, smoking, pets, sleep_schedule, noise_tolerance, guests_frequency,
       remote_work, cleanliness, sociability, private_space, cooking, shared_products,
       temperature, common_zones, leisure, pet_tolerance)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     on conflict (profile_id) do update set
       districts=excluded.districts, smoking=excluded.smoking, pets=excluded.pets,
       sleep_schedule=excluded.sleep_schedule, noise_tolerance=excluded.noise_tolerance,
       guests_frequency=excluded.guests_frequency, remote_work=excluded.remote_work,
       cleanliness=excluded.cleanliness, sociability=excluded.sociability,
       private_space=excluded.private_space, cooking=excluded.cooking,
       shared_products=excluded.shared_products, temperature=excluded.temperature,
       common_zones=excluded.common_zones, leisure=excluded.leisure,
       pet_tolerance=excluded.pet_tolerance, updated_at=now()
     returning *`,
    [
      user.id,
      p.districts,
      p.smoking,
      p.pets,
      p.sleep_schedule,
      p.noise_tolerance ?? null,
      p.guests_frequency,
      p.remote_work,
      p.cleanliness ?? null,
      p.sociability ?? null,
      p.private_space ?? null,
      p.cooking ?? null,
      p.shared_products,
      p.temperature ?? null,
      p.common_zones ?? null,
      p.leisure,
      p.pet_tolerance,
    ],
  );
  refreshProfile(user.id);
  return result.rows[0];
}

export async function saveLifestyleAnswers(answers: Array<{
  questionKey: string;
  answer: unknown;
  importance: number;
}>) {
  const user = await requireUser();
  if (answers.length === 0 || answers.length > 100) throw new Error("Некорректное число ответов");
  const parsed = answers.map((answer) => {
    const result = LifestyleAnswerSchema.safeParse(answer);
    if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Проверьте ответы");
    return result.data;
  });
  await withTransaction(async (client) => {
    for (const answer of parsed) {
      await client.query(
        `insert into lifestyle_answers (profile_id, question_key, answer, importance)
         values ($1, $2, $3::jsonb, $4)
         on conflict (profile_id, question_key) do update
           set answer = excluded.answer, importance = excluded.importance, updated_at = now()`,
        [user.id, answer.questionKey, JSON.stringify(answer.answer), answer.importance],
      );
    }
  });
  refreshProfile(user.id);
}

export async function saveCompatibilityWeights(weights: Array<{ criterion: string; weight: number }>) {
  const user = await requireUser();
  if (weights.length === 0 || weights.length > 30) throw new Error("Некорректные веса совместимости");
  const parsed = weights.map((weight) => {
    const result = CompatibilityWeightsSchema.safeParse(weight);
    if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Проверьте веса");
    return result.data;
  });
  await withTransaction(async (client) => {
    for (const weight of parsed) {
      await client.query(
        `insert into compatibility_weights (profile_id, criterion, weight)
         values ($1, $2, $3) on conflict (profile_id, criterion) do update set weight = excluded.weight`,
        [user.id, weight.criterion, weight.weight],
      );
    }
  });
  refreshProfile(user.id);
}

export async function uploadAvatar(_file: File) {
  throw new Error("Аватар загружается напрямую в защищённое хранилище через API профиля");
}

export async function registerAvatar(storagePath: string) {
  const user = await requireUser();
  const result = await query(
    `update profiles set avatar_path = $2, updated_at = now() where id = $1 returning avatar_path`,
    [user.id, storagePath],
  );
  refreshProfile(user.id);
  return result.rows[0];
}

export async function getPublicProfiles(filters?: {
  query?: string;
  city?: string;
  minCompatibility?: number;
  limit?: number;
}) {
  const current = await getCurrentUser();
  const values: unknown[] = [current?.id ?? null];
  const conditions = ["p.is_public = true", "u.disabled_at is null", "($1::uuid is null or p.id <> $1::uuid)"];
  if (filters?.query?.trim()) {
    values.push(`%${filters.query.trim()}%`);
    conditions.push(`(p.display_name ilike $${values.length} or coalesce(p.job_title, '') ilike $${values.length})`);
  }
  if (filters?.city) {
    values.push(filters.city);
    conditions.push(`p.city = $${values.length}`);
  }
  values.push(Math.min(60, Math.max(1, filters?.limit ?? 24)));
  const result = await query(
    `select p.id, p.display_name, p.age, p.job_title, p.city, p.avatar_path,
            p.budget_min, p.budget_max, p.is_public,
            coalesce(to_jsonb(pp) - 'profile_id', '{}'::jsonb) as profile_preferences,
            (u.email_verified_at is not null) as email_verified,
            (p.phone_verified_at is not null) as phone_verified
       from profiles p join users u on u.id = p.id
       left join profile_preferences pp on pp.profile_id = p.id
      where ${conditions.join(" and ")} order by p.updated_at desc limit $${values.length}`,
    values,
  );
  return result.rows;
}

export async function getProfileWithCompatibility(targetId: string) {
  const user = await requireUser();
  const [target, me] = await Promise.all([getProfile(targetId), getProfile(user.id)]);
  if (!target) throw new Error("Профиль не найден");
  if (!me) throw new Error("Заполните свой профиль");
  return { target, me };
}

export async function togglePublicProfile(isPublic: boolean) {
  return updateProfile({ is_public: isPublic });
}

export async function getFavorites() {
  const user = await requireUser();
  const result = await query(
    `select f.*, p.display_name as profile_name, p.avatar_path as profile_avatar,
            pr.title as property_title, pr.monthly_rent as property_price
       from favorites f
       left join profiles p on f.subject_type = 'profile' and p.id = f.subject_id
       left join properties pr on f.subject_type = 'property' and pr.id = f.subject_id
      where f.user_id = $1 order by f.created_at desc`,
    [user.id],
  );
  return result.rows;
}

export async function toggleFavorite(targetType: "profile" | "property" | "group", targetId: string) {
  const user = await requireUser();
  if (targetType === "group") throw new Error("Группы нельзя добавлять в избранное");
  if (targetType === "profile" && targetId === user.id) throw new Error("Нельзя добавить себя в избранное");
  const result = await withTransaction(async (client) => {
    const existing = await client.query(
      `select 1 from favorites where user_id = $1 and subject_type = $2 and subject_id = $3`,
      [user.id, targetType, targetId],
    );
    if (existing.rowCount) {
      await client.query(
        `delete from favorites where user_id = $1 and subject_type = $2 and subject_id = $3`,
        [user.id, targetType, targetId],
      );
      return false;
    }
    const target = targetType === "profile"
      ? await client.query(`select 1 from profiles where id = $1 and is_public = true`, [targetId])
      : await client.query(`select 1 from properties where id = $1 and status = 'published'`, [targetId]);
    if (!target.rowCount) throw new Error("Объект избранного не найден");
    await client.query(
      `insert into favorites (user_id, subject_type, subject_id) values ($1, $2, $3)`,
      [user.id, targetType, targetId],
    );
    return true;
  });
  revalidatePath("/app/favorites");
  return { active: result };
}
