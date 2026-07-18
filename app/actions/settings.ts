"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Профиль не найден");
  return data;
}

export async function getProfilePreferences(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_preferences")
    .select("*")
    .eq("profile_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error("Не удалось загрузить настройки");
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<{
  display_name: string;
  age: number | null;
  job_title: string | null;
  bio: string | null;
  city: string;
  budget_min: number | null;
  budget_max: number | null;
  move_in_date: string | null;
  lease_months: number | null;
  is_public: boolean;
  avatar_path: string | null;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error("Не удалось обновить профиль");
  revalidatePath("/app/profile");
  revalidatePath("/owner/profile");
  revalidatePath("/app/settings");
  revalidatePath("/owner/settings");
  return data;
}

export async function updateProfilePreferences(userId: string, preferences: Partial<{
  districts: string[];
  smoking: "no" | "sometimes" | "yes" | "indifferent";
  pets: "no" | "cat" | "dog" | "other" | "indifferent";
  sleep_schedule: "early" | "late" | "flexible";
  noise_tolerance: number;
  guests_frequency: "never" | "rarely" | "sometimes" | "often";
  remote_work: "never" | "sometimes" | "often";
  cleanliness: number;
  sociability: number;
  private_space: number;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_preferences")
    .upsert({ profile_id: userId, ...preferences, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error("Не удалось обновить настройки");
  revalidatePath("/app/profile");
  revalidatePath("/owner/profile");
  revalidatePath("/app/settings");
  revalidatePath("/owner/settings");
  return data;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) throw new Error("Неверный текущий пароль");

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function updateEmail(newEmail: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = await createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error("Не удалось загрузить аватар");

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const publicUrl = data.publicUrl;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: filePath, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error("Не удалось обновить аватар");

  return publicUrl;
}

export async function updateNotificationSettings(userId: string, settings: {
  email_notifications: boolean;
  push_notifications: boolean;
  new_messages: boolean;
  new_applications: boolean;
  application_updates: boolean;
  group_invites: boolean;
  marketing_emails: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ 
      notification_settings: settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error("Не удалось обновить настройки уведомлений");
  revalidatePath("/app/settings");
  revalidatePath("/owner/settings");
}

export async function updateOwnerSettings(data: {
  newApplications: boolean;
  quickReplies: boolean;
  phoneVerification: boolean;
}, section: string) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Не авторизован");
  }

  const { error } = await supabase
    .from("owner_settings" as any)
    .upsert({
      user_id: user.id,
      new_applications: data.newApplications,
      quick_replies: data.quickReplies,
      phone_verification: data.phoneVerification,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/owner/settings");
  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Delete user data first
  await supabase.from("profiles").delete().eq("id", user.id);
  await supabase.from("profile_preferences").delete().eq("profile_id", user.id);
  await supabase.from("lifestyle_answers").delete().eq("profile_id", user.id);
  await supabase.from("compatibility_weights").delete().eq("profile_id", user.id);
  await supabase.from("group_members").delete().eq("profile_id", user.id);
  await supabase.from("application_members").delete().eq("profile_id", user.id);
  await supabase.from("conversation_members").delete().eq("profile_id", user.id);
  await supabase.from("messages").delete().eq("sender_id", user.id);
  await supabase.from("favorites").delete().eq("user_id", user.id);
  await supabase.from("verification_statuses").delete().eq("subject_id", user.id);
  
  // Delete auth user
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  return { success: true };
}