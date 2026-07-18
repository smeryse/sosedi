"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile(userId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !userId) return null;

  const targetId = userId || user!.id;

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      profile_preferences (*),
      lifestyle_answers (question_key, answer, importance),
      compatibility_weights (criterion, weight),
      user_roles (role)
    `)
    .eq("id", targetId)
    .single();

  if (error) return null;
  return data;
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error("Не удалось обновить профиль");
  revalidatePath("/app/profile");
  revalidatePath("/app/settings");
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
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("profile_preferences")
    .upsert({
      profile_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error("Не удалось обновить предпочтения");
  revalidatePath("/app/profile");
  revalidatePath("/app/settings");
}

export async function saveLifestyleAnswers(answers: Array<{
  question_key: string;
  answer: any;
  importance: number;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  for (const answer of answers) {
    const { error } = await supabase
      .from("lifestyle_answers")
      .upsert({
        profile_id: user.id,
        question_key: answer.question_key,
        answer: answer.answer,
        importance: answer.importance,
        updated_at: new Date().toISOString(),
      });

    if (error) throw new Error(`Не удалось сохранить ответ: ${error.message}`);
  }

  revalidatePath("/app/profile");
  revalidatePath("/app/compatibility");
}

export async function saveCompatibilityWeights(weights: Array<{
  criterion: string;
  weight: number;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Delete old weights
  await supabase.from("compatibility_weights").delete().eq("profile_id", user.id);

  // Insert new weights
  const { error } = await supabase.from("compatibility_weights").insert(
    weights.map(w => ({
      profile_id: user.id,
      criterion: w.criterion,
      weight: w.weight,
    }))
  );

  if (error) throw new Error("Не удалось сохранить веса совместимости");
  revalidatePath("/app/compatibility");
}

export async function uploadAvatar(file: File) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error("Не удалось загрузить аватар");

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: filePath, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error("Не удалось обновить аватар");

  revalidatePath("/app/profile");
  revalidatePath("/app/settings");
  return data.publicUrl;
}

export async function getPublicProfiles(filters?: {
  query?: string;
  city?: string;
  minCompatibility?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(`
      id, display_name, age, job_title, city, avatar_path,
      budget_min, budget_max, is_public,
      profile_preferences (districts, smoking, pets, sleep_schedule)
    `)
    .eq("is_public", true)
    .is("archived_at", null)
    .limit(filters?.limit || 24);

  if (filters?.query) {
    query = query.ilike("display_name", `%${filters.query}%`);
  }
  if (filters?.city) {
    query = query.eq("city", filters.city);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function getProfileWithCompatibility(targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: target, error } = await supabase
    .from("profiles")
    .select(`
      *,
      profile_preferences (*),
      lifestyle_answers (question_key, answer, importance),
      compatibility_weights (criterion, weight)
    `)
    .eq("id", targetId)
    .single();

  if (error || !target) throw new Error("Профиль не найден");

  // Get current user's preferences for compatibility calculation
  const { data: me } = await supabase
    .from("profiles")
    .select(`
      *,
      profile_preferences (*),
      lifestyle_answers (question_key, answer, importance),
      compatibility_weights (criterion, weight)
    `)
    .eq("id", user.id)
    .single();

  return { target, me };
}

export async function togglePublicProfile(isPublic: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("profiles")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error("Не удалось изменить видимость");
  revalidatePath("/app/profile");
  revalidatePath("/app/settings");
}

export async function getFavorites() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      target_type, target_id, created_at,
      profiles!favorites_target_id_fkey (id, display_name, avatar_path, age, job_title, budget_max, city, compatibility),
      properties!favorites_target_id_fkey (id, title, district, monthly_rent, rooms, area, images)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export async function toggleFavorite(targetType: "profile" | "property" | "group", targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .single();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    revalidatePath("/app/favorites");
    return { added: false };
  } else {
    await supabase.from("favorites").insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
    });
    revalidatePath("/app/favorites");
    return { added: true };
  }
}