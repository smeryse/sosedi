"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

export async function getUserSettings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from as any)("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return null;
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

export async function updateUserSettings(userId: string, settings: Partial<{
  theme: "light" | "dark" | "system";
  language: "ru" | "en";
  compact_mode: boolean;
  animations_enabled: boolean;
  show_avatars: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  new_messages: boolean;
  new_applications: boolean;
  application_updates: boolean;
  group_invites: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  profile_visibility: "public" | "contacts" | "private";
  show_online_status: boolean;
  show_last_active: boolean;
  show_phone: boolean;
  show_email: boolean;
  personalized_ads: boolean;
  analytics_opt_in: boolean;
}>) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from as any)("user_settings")
    .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error("Не удалось обновить настройки");
  revalidatePath("/app/settings");
  revalidatePath("/owner/settings");
  return data;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

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

export async function enable2FA() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Sosedi App",
  });

  if (error) throw new Error(error.message);

  return { 
    success: true, 
    qrCode: (data.totp as any)?.qr_code || (data.totp as any)?.qrCode,
    secret: (data.totp as any)?.secret,
    factorId: data.id 
  };
}

export async function verify2FA(factorId: string, code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) throw new Error("Неверный код. Попробуйте снова.");

  return { success: true };
}

export async function disable2FA(factorId: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  });

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function getMFAFactors() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.listFactors();

  if (error) throw new Error(error.message);

  return data.all;
}

export async function getActiveSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data, error } = await supabase.auth.getSession();

  if (error) throw new Error(error.message);

  return data.session;
}

export async function revokeSession(sessionId: string) {
  const supabase = await createClient();
  const { error } = await (supabase.auth.admin as any).revokeRefreshToken?.(sessionId) || { error: null };

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function revokeAllOtherSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function exportUserData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const [
    profile,
    preferences,
    settings,
    lifestyleAnswers,
    compatibilityWeights,
    favorites,
    groups,
    applications,
    messages,
    conversations,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("profile_preferences").select("*").eq("profile_id", user.id).single(),
    (supabase.from as any)("user_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("lifestyle_answers").select("*").eq("profile_id", user.id),
    supabase.from("compatibility_weights").select("*").eq("profile_id", user.id),
    supabase.from("favorites").select("*").eq("user_id", user.id),
    supabase.from("group_members").select("*").eq("profile_id", user.id),
    supabase.from("applications").select("*").or(`created_by.eq.${user.id},application_members.profile_id.eq.${user.id}`),
    supabase.from("messages").select("*").eq("sender_id", user.id),
    supabase.from("conversation_members").select("*").eq("profile_id", user.id),
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    profile: profile.data,
    preferences: preferences.data,
    settings: settings.data,
    lifestyleAnswers: lifestyleAnswers.data,
    compatibilityWeights: compatibilityWeights.data,
    favorites: favorites.data,
    groups: groups.data,
    applications: applications.data,
    messages: messages.data,
    conversations: conversations.data,
  };

  return exportData;
}

export async function blockUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await (supabase.from as any)("blocked_users")
    .insert({
      blocker_id: user.id,
      blocked_id: targetUserId,
    });

  if (error) throw new Error(error.message);

  revalidatePath("/app/settings");
  return { success: true };
}

export async function unblockUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await (supabase.from as any)("blocked_users")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

  if (error) throw new Error(error.message);

  revalidatePath("/app/settings");
  return { success: true };
}

export async function getBlockedUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await (supabase.from as any)("blocked_users")
    .select(`
      blocked_id,
      created_at,
      profiles!blocked_users_blocked_id_fkey (id, display_name, avatar_path, city)
    `)
    .eq("blocker_id", user.id);

  if (error) return [];
  return data || [];
}

export async function getReferralStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: referrals } = await (supabase.from as any)("referrals")
    .select("*")
    .eq("referrer_id", user.id);

  const { data: referralCode } = await (supabase.from as any)("referral_codes")
    .select("code, balance, total_earned")
    .eq("user_id", user.id)
    .single();

  return {
    referrals: referrals || [],
    code: (referralCode as any)?.code,
    balance: (referralCode as any)?.balance || 0,
    totalEarned: (referralCode as any)?.total_earned || 0,
  };
}

export async function generateReferralCode() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  const { error } = await (supabase.from as any)("referral_codes")
    .upsert({
      user_id: user.id,
      code,
      balance: 0,
      total_earned: 0,
    });

  if (error) throw new Error(error.message);

  revalidatePath("/app/settings");
  return { success: true, code };
}

export async function getConnectedAccounts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const identities = user.identities || [];
  return identities.map(id => ({
    provider: id.provider,
    providerId: id.id,
    email: id.identity_data?.email,
    name: id.identity_data?.full_name || id.identity_data?.name,
    avatar: id.identity_data?.avatar_url,
    connectedAt: id.created_at,
  }));
}

export async function disconnectOAuthProvider(provider: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");
  const identity = user.identities?.find((i: any) => i.provider === provider);
  if (!identity) throw new Error("Провайдер не найден");

  const { error } = await supabase.auth.unlinkIdentity(identity);

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
  weekly_digest: boolean;
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
  await (supabase.from as any)("blocked_users").delete().eq("blocker_id", user.id);
  await (supabase.from as any)("blocked_users").delete().eq("blocked_id", user.id);
  await (supabase.from as any)("referrals").delete().eq("referrer_id", user.id);
  await (supabase.from as any)("referral_codes").delete().eq("user_id", user.id);
  
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  return { success: true };
}