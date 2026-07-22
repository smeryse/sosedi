"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Check, ShieldCheck, Loader2, AlertCircle, Save, Bell, LockKeyhole, Settings2, UserRound, ArrowLeft, Eye, EyeOff, Mail, Smartphone, Trash2 } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, getProfile, updateProfile, uploadAvatar, updatePassword, updateEmail, deleteAccount } from "@/app/actions/settings";
import { Switch } from "@/components/ui/switch";

interface OwnerProfile {
  id: string;
  display_name: string;
  age: number;
  job_title: string;
  bio: string;
  city: string;
  is_public: boolean;
  avatar_path: string | null;
  notification_settings?: {
    newApplications: boolean;
    quickReplies: boolean;
    phoneVerification: boolean;
  };
}

type Tab = "profile" | "notifications" | "security";

export default function OwnerProfileSettingsPage() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
  });

  async function loadProfile() {
    try {
      const user = await getCurrentUser();
      if (user) {
        const data = await getProfile(user.id);
        if (data) {
          setProfile({
            id: data.id,
            display_name: data.display_name ?? "",
            age: data.age ?? 25,
            job_title: data.job_title ?? "",
            bio: data.bio ?? "",
            city: data.city ?? "",
            is_public: data.is_public ?? true,
            avatar_path: data.avatar_path,
          });
          if (data.avatar_path) setAvatarPreview(data.avatar_path);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      await updateProfile(user.id, profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка сохранения");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Файл слишком большой (макс. 2 МБ)");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarPreview(url);
      setProfile(prev => prev ? { ...prev, avatar_path: url } : null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка загрузки аватара");
      }
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Новые пароли не совпадают");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError("Пароль должен содержать не менее 8 символов");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка смены пароля");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!emailForm.newEmail) return;

    setSaving(true);
    setError(null);
    try {
      await updateEmail(emailForm.newEmail);
      setEmailForm({ newEmail: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка смены email");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Вы уверены? Это действие нельзя отменить. Все ваши данные, объявления, сообщения и история будут удалены навсегда.")) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await deleteAccount();
      window.location.href = "/auth/login";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка удаления аккаунта");
      }
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "profile", label: "Профиль", icon: UserRound },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "security", label: "Безопасность", icon: LockKeyhole },
  ] as const;

  if (loading) {
    return (
      <PageFrame title="Загрузка..." description="Пожалуйста, подождите.">
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </PageFrame>
    );
  }

  const initialOwnerSettings = {
    newApplications: true,
    quickReplies: true,
    phoneVerification: false,
  };

  return (
    <PageFrame
      title={activeTab === "profile" ? (profile?.display_name || "Профиль") : (tabs.find(t => t.id === activeTab)?.label || "Настройки")}
      description={
        activeTab === "profile"
          ? "Информация, которую видят арендаторы. Контакты остаются скрытыми до взаимного согласия."
          : activeTab === "notifications"
            ? "Настройте уведомления о новых заявках и быстрые ответы."
            : "Управление паролем, email и доступом к аккаунту."
      }
    >
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-[14px] bg-red-50 p-4 text-red-700 text-sm" role="alert">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-[14px] bg-green-50 p-4 text-green-700 text-sm" role="status">
          <Check className="size-5 shrink-0" />
          Изменения сохранены
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-5 flex gap-1 rounded-[14px] border border-border bg-background p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex h-10 items-center gap-2 rounded-[12px] px-4 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface-card flex flex-col items-center p-6 text-center">
            <div className="relative">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Аватар"
                  width={128}
                  height={128}
                  className="size-32 rounded-full object-cover"
                />
              ) : (
                <div className="size-32 rounded-full bg-surface-muted flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {profile?.display_name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full bg-accent cursor-pointer">
                <Camera className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
            </div>
            <h2 className="mt-4 text-lg font-extrabold">
              {profile?.display_name || "Имя"}, {profile?.age ? `${profile.age}` : ""}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {profile?.job_title || "Собственник"} · {profile?.city || "Город"}
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-full bg-[hsl(var(--accent-soft))] px-3 py-2 text-[10px] font-extrabold">
              <ShieldCheck className="size-3.5" />
              Профиль {profile?.is_public ? "публичный" : "скрыт"}
            </div>
          </aside>

          <div className="space-y-4">
            <section className="surface-card p-5">
              <h2 className="font-extrabold">Основная информация</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-extrabold">
                  Имя
                  <input
                    type="text"
                    required
                    defaultValue={profile?.display_name || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, display_name: e.target.value } : null)}
                    className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                  />
                </label>
                <label className="text-xs font-extrabold">
                  Возраст
                  <input
                    type="number"
                    min={18}
                    max={100}
                    defaultValue={profile?.age || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, age: parseInt(e.target.value) || 0 } : null)}
                    className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                  />
                </label>
                <label className="text-xs font-extrabold sm:col-span-2">
                  Работа
                  <input
                    type="text"
                    defaultValue={profile?.job_title || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, job_title: e.target.value } : null)}
                    className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                  />
                </label>
                <label className="text-xs font-extrabold sm:col-span-2">
                  О себе
                  <textarea
                    defaultValue={profile?.bio || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, bio: e.target.value } : null)}
                    rows={4}
                    className="mt-2 w-full rounded-[14px] border bg-background p-3 text-sm font-normal outline-none"
                  />
                </label>
                <label className="text-xs font-extrabold">
                  Город
                  <input
                    type="text"
                    defaultValue={profile?.city || "Краснодар"}
                    onChange={(e) => setProfile(p => p ? { ...p, city: e.target.value } : null)}
                    className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                  />
                </label>
              </div>
            </section>

            <section className="surface-card p-5">
              <h2 className="font-extrabold">Настройки видимости</h2>
              <div className="mt-5 flex items-end">
                <label className="text-xs font-extrabold flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={profile?.is_public ?? true}
                    onChange={(e) => setProfile(p => p ? { ...p, is_public: e.target.checked } : null)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Профиль виден потенциальным арендаторам
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Сохранить изменения
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "notifications" && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <section className="space-y-5 rounded-xl border p-5">
            <h3 className="flex items-center gap-2 font-extrabold">
              <Bell className="size-4" />
              Уведомления о заявках
            </h3>
            <label className="flex items-center gap-4 cursor-pointer">
              <Switch
                checked={profile?.notification_settings?.newApplications ?? true}
                onCheckedChange={(v) => setProfile(p => p ? {
                  ...p,
                  notification_settings: { ...p.notification_settings!, newApplications: v }
                } : null)}
                disabled={saving}
              />
              <div>
                <p className="text-sm font-extrabold">Новые заявки на жильё</p>
                <p className="mt-1 text-xs text-muted-foreground">Получать письмо о новых откликах</p>
              </div>
            </label>
            <label className="flex items-center gap-4 cursor-pointer">
              <Switch
                checked={profile?.notification_settings?.quickReplies ?? true}
                onCheckedChange={(v) => setProfile(p => p ? {
                  ...p,
                  notification_settings: { ...p.notification_settings!, quickReplies: v }
                } : null)}
                disabled={saving}
              />
              <div>
                <p className="text-sm font-extrabold">Быстрые ответы</p>
                <p className="mt-1 text-xs text-muted-foreground">Сохранять шаблоны сообщений</p>
              </div>
            </label>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Сохранить изменения
              </>
            )}
          </button>
        </form>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl space-y-8">
          <section className="space-y-5 rounded-xl border p-5">
            <h3 className="flex items-center gap-2 font-extrabold">
              <LockKeyhole className="size-4" />
              Смена пароля
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <label className="text-xs font-extrabold">
                Текущий пароль
                <div className="relative mt-2">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="h-11 w-full rounded-[14px] border bg-background pl-4 pr-11 text-sm font-normal outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>
              <label className="text-xs font-extrabold">
                Новый пароль
                <div className="relative mt-2">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="h-11 w-full rounded-[14px] border bg-background pl-4 pr-11 text-sm font-normal outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>
              <label className="text-xs font-extrabold">
                Подтвердите новый пароль
                <div className="relative mt-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="h-11 w-full rounded-[14px] border bg-background pl-4 pr-11 text-sm font-normal outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Изменить пароль
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="space-y-5 rounded-xl border p-5">
            <h3 className="flex items-center gap-2 font-extrabold">
              <Mail className="size-4" />
              Смена email
            </h3>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <label className="text-xs font-extrabold">
                Новый email
                <input
                  type="email"
                  required
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ newEmail: e.target.value })}
                  className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={saving || !emailForm.newEmail}
                className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Изменить email
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="space-y-5 rounded-xl border bg-red-50 p-5 border-red-200">
            <h3 className="flex items-center gap-2 font-extrabold text-red-700">
              <Trash2 className="size-4" />
              Удаление аккаунта
            </h3>
            <p className="text-sm text-red-600">
              Это действие необратимо. Все ваши данные, объявления, сообщения и история будут удалены навсегда.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Удалить аккаунт
                </>
              )}
            </button>
          </section>
        </div>
      )}
    </PageFrame>
  );
}
