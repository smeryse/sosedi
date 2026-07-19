"use client";

import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Check, ShieldCheck, Loader2, Save, AlertCircle, Bell, LockKeyhole, Mail, Smartphone, Trash2, Eye, EyeOff, LogOut, Settings2, UserRound, ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, uploadAvatar, getProfile, getCurrentUser, getProfilePreferences, updateProfilePreferences, updatePassword, updateEmail, deleteAccount, updateNotificationSettings } from "@/app/actions/settings";

interface Profile {
  id: string;
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
  districts?: string[];
  smoking?: "no" | "sometimes" | "yes" | "indifferent";
  pets?: "no" | "cat" | "dog" | "other" | "indifferent";
  sleep_schedule?: "early" | "late" | "flexible";
  noise_tolerance?: number | null;
  guests_frequency?: "never" | "rarely" | "sometimes" | "often" | null;
  remote_work?: "never" | "sometimes" | "often" | null;
  cleanliness?: number | null;
  sociability?: number | null;
  private_space?: number | null;
  notification_settings?: {
    email_notifications: boolean;
    push_notifications: boolean;
    new_messages: boolean;
    new_applications: boolean;
    application_updates: boolean;
    group_invites: boolean;
    marketing_emails: boolean;
  };
  updated_at?: string;
}

type Tab = "profile" | "dna" | "verification" | "notifications" | "security";

export default function TenantProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Симулятор верификации
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0); // 0: init, 1: inputs, 2: loader, 3: success
  const [checkingProgress, setCheckingProgress] = useState([
    { id: 1, label: "Проверка паспорта по базам розыска МВД РФ", status: "idle" },
    { id: 2, label: "Проверка отсутствия задолженностей ФССП", status: "idle" },
    { id: 3, label: "Проверка в реестре финансового мониторинга", status: "idle" },
  ]);
  const [phoneOrSnils, setPhoneOrSnils] = useState("");
  const [gosuPassword, setGosuPassword] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const verified = localStorage.getItem("sosedi_verified") === "true";
      setIsVerified(verified);
      if (verified) {
        setVerificationStep(3);
      }
    }
  }, []);

  const startVerificationProcess = () => {
    if (!phoneOrSnils || !gosuPassword) {
      alert("Пожалуйста, заполните поля авторизации.");
      return;
    }
    setVerificationStep(2);
    setCheckingProgress([
      { id: 1, label: "Проверка паспорта по базам розыска МВД РФ", status: "loading" },
      { id: 2, label: "Проверка отсутствия задолженностей ФССП", status: "idle" },
      { id: 3, label: "Проверка в реестре финансового мониторинга", status: "idle" },
    ]);

    setTimeout(() => {
      setCheckingProgress(prev =>
        prev.map(item =>
          item.id === 1 ? { ...item, status: "success" } :
          item.id === 2 ? { ...item, status: "loading" } : item
        )
      );
    }, 1500);

    setTimeout(() => {
      setCheckingProgress(prev =>
        prev.map(item =>
          item.id === 2 ? { ...item, status: "success" } :
          item.id === 3 ? { ...item, status: "loading" } : item
        )
      );
    }, 3000);

    setTimeout(() => {
      setCheckingProgress(prev =>
        prev.map(item =>
          item.id === 3 ? { ...item, status: "success" } : item
        )
      );
    }, 4500);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("sosedi_verified", "true");
      }
      setIsVerified(true);
      setVerificationStep(3);
    }, 5500);
  };

  const handleResetVerification = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sosedi_verified");
    }
    setIsVerified(false);
    setVerificationStep(0);
    setPhoneOrSnils("");
    setGosuPassword("");
    setCheckingProgress([
      { id: 1, label: "Проверка паспорта по базам розыска МВД РФ", status: "idle" },
      { id: 2, label: "Проверка отсутствия задолженностей ФССП", status: "idle" },
      { id: 3, label: "Проверка в реестре финансового мониторинга", status: "idle" },
    ]);
  };

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

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const user = await getCurrentUser();
      if (user) {
        const [profileData, preferencesData] = await Promise.all([
          getProfile(user.id),
          getProfilePreferences(user.id)
        ]);
        if (profileData) {
          setProfile({ ...profileData, ...preferencesData });
          setAvatarPreview(profileData.avatar_path);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка загрузки профиля");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!profile) throw new Error("Профиль не загружен");
      
      await updateProfile(profile.id, {
        display_name: profile.display_name,
        age: profile.age ?? undefined,
        job_title: profile.job_title ?? undefined,
        bio: profile.bio ?? undefined,
        city: profile.city ?? undefined,
        budget_min: profile.budget_min ?? undefined,
        budget_max: profile.budget_max ?? undefined,
        move_in_date: profile.move_in_date ?? undefined,
        lease_months: profile.lease_months ?? undefined,
        is_public: profile.is_public ?? undefined,
        avatar_path: profile.avatar_path ?? undefined,
      });
      
      await updateProfilePreferences(profile.id, {
        districts: profile.districts,
        smoking: profile.smoking,
        pets: profile.pets,
        sleep_schedule: profile.sleep_schedule,
        noise_tolerance: profile.noise_tolerance ?? undefined,
        guests_frequency: profile.guests_frequency,
        remote_work: profile.remote_work,
        cleanliness: profile.cleanliness ?? undefined,
        sociability: profile.sociability ?? undefined,
        private_space: profile.private_space ?? undefined,
      });
      
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

    try {
      const url = await uploadAvatar(profile.id, file);
      setAvatarPreview(url);
      setProfile({ ...profile, avatar_path: url });
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

  async function handleNotificationSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile?.notification_settings) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      await updateNotificationSettings(user.id, {
        weekly_digest: false,
        ...profile.notification_settings,
      });
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

  async function handlePasswordChange(e: FormEvent) {
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

  async function handleEmailChange(e: FormEvent) {
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
    if (!window.confirm("Вы уверены? Это действие нельзя отменить. Все ваши данные будут удалены навсегда.")) {
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
    { id: "dna", label: "Быт и привычки", icon: Settings2 },
    { id: "verification", label: "Верификация", icon: ShieldCheck },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "security", label: "Безопасность", icon: LockKeyhole },
  ] as const;

  if (loading) {
    return (
      <PageFrame eyebrow="Профиль и настройки" title="Загрузка..." description="Пожалуйста, подождите.">
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      eyebrow="Профиль и настройки"
      title={activeTab === "profile" ? (profile?.display_name || "Профиль") : (tabs.find(t => t.id === activeTab)?.label || "Настройки")}
      description={activeTab === "profile" 
        ? "Так вас видят потенциальные соседи. Личные контакты остаются скрытыми до взаимного согласия."
        : activeTab === "verification"
          ? "Пройдите верификацию личности для повышения доверия арендодателей и соарендаторов."
          : activeTab === "notifications"
            ? "Настройте, какие уведомления хотите получать."
            : "Управление паролем, email и доступом к аккаунту."}
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
        <form onSubmit={handleProfileSubmit} className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
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
              {profile?.job_title || "Работа"} · {profile?.city || "Город"}
            </p>
            <div className="mt-5 flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2 rounded-full bg-[hsl(var(--accent-soft))] px-3 py-2 text-[10px] font-extrabold justify-center">
                <ShieldCheck className="size-3.5" />
                Профиль {profile?.is_public ? "публичный" : "скрыт"}
              </div>
              {isVerified && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 text-[10px] font-extrabold justify-center">
                  <ShieldCheck className="size-3.5 text-emerald-600 animate-pulse" />
                  Проверен АЗКК
                </div>
              )}
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
                    onChange={(e) => setProfile(p => p ? { ...p, age: Math.min(100, Math.max(18, parseInt(e.target.value) || 18)) } : null)}
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
                <label className="text-xs font-extrabold sm:col-span-2">
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
              <h2 className="font-extrabold">Бюджет и условия</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-extrabold">
                  Мин. бюджет
                  <input
                    type="number"
                    min={0}
                    defaultValue={profile?.budget_min || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, budget_min: parseInt(e.target.value) || 0 } : null)}
                    className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                  />
                </label>
                <label className="text-xs font-extrabold">
                  Макс. бюджет
                  <input
                    type="number"
                    min={0}
                    defaultValue={profile?.budget_max || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, budget_max: parseInt(e.target.value) || 0 } : null)}
                    className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                  />
                </label>
                <label className="text-xs font-extrabold">
                  Дата заезда
                  <input
                    type="date"
                    defaultValue={profile?.move_in_date || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, move_in_date: e.target.value } : null)}
                    className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                  />
                </label>
                <label className="text-xs font-extrabold">
                  Срок (мес.)
                  <input
                    type="number"
                    min={1}
                    max={120}
                    defaultValue={profile?.lease_months || ""}
                    onChange={(e) => setProfile(p => p ? { ...p, lease_months: parseInt(e.target.value) || 0 } : null)}
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
                  Профиль виден потенциальным соседям
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
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
      {activeTab === "dna" && (
        <form onSubmit={handleProfileSubmit} className="max-w-2xl space-y-6">
          <section className="space-y-5 rounded-xl border p-5">
            <h3 className="flex items-center gap-2 font-extrabold">
              <Settings2 className="size-4" />
              Быт и привычки (Living DNA)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-extrabold">
                Курение
                <select
                  value={profile?.smoking || "no"}
                  onChange={(e) => setProfile(p => p ? { ...p, smoking: e.target.value as any } : null)}
                  className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                >
                  <option value="no">Не курю</option>
                  <option value="sometimes">Иногда</option>
                  <option value="yes">Курю</option>
                  <option value="indifferent">Всё равно</option>
                </select>
              </label>
              <label className="text-xs font-extrabold">
                Режим сна
                <select
                  value={profile?.sleep_schedule || "flexible"}
                  onChange={(e) => setProfile(p => p ? { ...p, sleep_schedule: e.target.value as any } : null)}
                  className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                >
                  <option value="early">Жаворонок</option>
                  <option value="late">Сова</option>
                  <option value="flexible">Гибкий график</option>
                </select>
              </label>
              <label className="text-xs font-extrabold">
                Питомцы
                <select
                  value={profile?.pets || "no"}
                  onChange={(e) => setProfile(p => p ? { ...p, pets: e.target.value as any } : null)}
                  className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                >
                  <option value="no">Нет</option>
                  <option value="cat">Кот / Кошка</option>
                  <option value="dog">Собака</option>
                  <option value="other">Другие</option>
                  <option value="indifferent">Всё равно</option>
                </select>
              </label>
              <label className="text-xs font-extrabold">
                Гости
                <select
                  value={profile?.guests_frequency || "sometimes"}
                  onChange={(e) => setProfile(p => p ? { ...p, guests_frequency: e.target.value as any } : null)}
                  className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                >
                  <option value="never">Никогда</option>
                  <option value="rarely">Редко</option>
                  <option value="sometimes">Иногда</option>
                  <option value="often">Часто</option>
                </select>
              </label>
              <label className="text-xs font-extrabold">
                Удалённая работа
                <select
                  value={profile?.remote_work || "sometimes"}
                  onChange={(e) => setProfile(p => p ? { ...p, remote_work: e.target.value as any } : null)}
                  className="mt-2 h-11 w-full rounded-[14px] border bg-background px-3 text-sm font-normal outline-none"
                >
                  <option value="never">В офисе</option>
                  <option value="sometimes">Гибрид</option>
                  <option value="often">Полностью удалённо</option>
                </select>
              </label>
            </div>
            
            <div className="mt-4 space-y-4 pt-4 border-t">
              <label className="text-xs font-extrabold block">
                Чистоплотность ({profile?.cleanliness || 3}/5)
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={profile?.cleanliness || 3}
                  onChange={(e) => setProfile(p => p ? { ...p, cleanliness: parseInt(e.target.value) } : null)}
                  className="mt-2 w-full accent-accent"
                />
              </label>
              <label className="text-xs font-extrabold block">
                Общительность ({profile?.sociability || 3}/5)
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={profile?.sociability || 3}
                  onChange={(e) => setProfile(p => p ? { ...p, sociability: parseInt(e.target.value) } : null)}
                  className="mt-2 w-full accent-accent"
                />
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Сохранить настройки
              </>
            )}
          </button>
        </form>
      )}


      {activeTab === "notifications" && (
        <form onSubmit={handleNotificationSubmit} className="max-w-2xl space-y-6">
          <section className="space-y-5 rounded-xl border p-5">
            <h3 className="flex items-center gap-2 font-extrabold">
              <Bell className="size-4" />
              Email-уведомления
            </h3>
            {[
              { key: "email_notifications" as const, label: "Общие email-уведомления" },
              { key: "new_messages" as const, label: "Новые сообщения" },
              { key: "new_applications" as const, label: "Новые заявки на жильё" },
              { key: "application_updates" as const, label: "Обновления по заявкам" },
              { key: "group_invites" as const, label: "Приглашения в группы" },
              { key: "marketing_emails" as const, label: "Маркетинговые письма" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={profile?.notification_settings?.[key] ?? true}
                  onChange={(e) => setProfile(p => p ? {
                    ...p,
                    notification_settings: {
                      ...p.notification_settings!,
                      [key]: e.target.checked
                    }
                  } : null)}
                  className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </section>

          <section className="space-y-5 rounded-xl border p-5">
            <h3 className="flex items-center gap-2 font-extrabold">
              <Smartphone className="size-4" />
              Push-уведомления
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={profile?.notification_settings?.push_notifications ?? true}
                onChange={(e) => setProfile(p => p ? {
                  ...p,
                  notification_settings: {
                    ...p.notification_settings!,
                    push_notifications: e.target.checked
                  }
                } : null)}
                className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm font-medium">Получать push-уведомления</span>
            </label>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Сохранить настройки
              </>
            )}
          </button>
        </form>
      )}

      {activeTab === "verification" && (
        <div className="max-w-2xl space-y-6">
          {verificationStep === 0 && (
            <section className="surface-card p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#111111]">Цифровой паспорт сожителя АЗКК</h3>
                  <p className="text-xs text-muted-foreground">Верификация через Госуслуги (ЕСИА)</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-[#555555]">
                Подтверждение личности позволяет застройщикам и собственникам жилья видеть в вас надежного арендатора. Проверенные пользователи получают на 80% больше предложений о совместной аренде и получают значок <b>«Проверен АЗКК»</b> в общем каталоге.
              </p>
              <div className="rounded-[16px] bg-surface-muted p-4 space-y-3">
                <p className="text-xs font-extrabold text-[#111111]">Что мы проверяем:</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">✓ Подлинность паспортных данных по базам МВД</li>
                  <li className="flex items-center gap-2">✓ Отсутствие крупных задолженностей в базе судебных приставов (ФССП)</li>
                  <li className="flex items-center gap-2">✓ Соответствие анкетных данных реальному возрасту</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setVerificationStep(1)}
                className="w-full lime-button rounded-full py-3.5 text-xs font-black flex items-center justify-center gap-2"
              >
                Начать верификацию
              </button>
            </section>
          )}

          {verificationStep === 1 && (
            <section className="surface-card overflow-hidden">
              <div className="bg-[#0A5CFF] p-4 text-white flex items-center justify-between">
                <span className="text-sm font-extrabold uppercase tracking-wider">ГОСУСЛУГИ</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">ЕСИА</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="text-center space-y-2">
                  <h3 className="font-extrabold text-base">Авторизация для подтверждения профиля</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Авторизуйтесь на портале Госуслуг для безопасной передачи базовых анкетных данных в приложение «Соседи».
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold text-muted-foreground">
                    Телефон / Email / СНИЛС
                    <input
                      type="text"
                      placeholder="+7 (999) 999-99-99"
                      value={phoneOrSnils}
                      onChange={(e) => setPhoneOrSnils(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[12px] border bg-background px-3 text-sm font-normal outline-none focus:border-[#0A5CFF]"
                    />
                  </label>
                  <label className="block text-xs font-extrabold text-muted-foreground">
                    Пароль
                    <input
                      type="password"
                      placeholder="Введите пароль"
                      value={gosuPassword}
                      onChange={(e) => setGosuPassword(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[12px] border bg-background px-3 text-sm font-normal outline-none focus:border-[#0A5CFF]"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationStep(0)}
                    className="w-1/2 border rounded-full py-3 text-xs font-extrabold text-muted-foreground"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={startVerificationProcess}
                    className="w-1/2 bg-[#0A5CFF] hover:bg-[#004BD6] text-white rounded-full py-3 text-xs font-extrabold transition-colors"
                  >
                    Войти и подтвердить
                  </button>
                </div>
              </div>
            </section>
          )}

          {verificationStep === 2 && (
            <section className="surface-card p-6 space-y-6">
              <div className="text-center space-y-3">
                <Loader2 className="size-10 animate-spin text-[#0A5CFF] mx-auto" />
                <h3 className="font-extrabold text-base">Выполняется государственная проверка</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Система безопасности отправляет запросы к официальным реестрам для подтверждения вашей благонадежности. Это займет несколько секунд.
                </p>
              </div>
              <div className="border-t pt-4 space-y-4">
                {checkingProgress.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className={item.status === "success" ? "text-emerald-700 font-bold" : item.status === "loading" ? "text-[#111111] font-bold" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                    <span>
                      {item.status === "success" && <span className="text-emerald-600 font-extrabold">✓ Готово</span>}
                      {item.status === "loading" && <Loader2 className="size-4 animate-spin text-[#0A5CFF]" />}
                      {item.status === "idle" && <span className="text-muted-foreground/50">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {verificationStep === 3 && (
            <section className="surface-card p-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 mx-auto border-4 border-emerald-50">
                  <ShieldCheck className="size-8" />
                </div>
                <h3 className="font-extrabold text-xl text-[#111111]">Профиль верифицирован</h3>
                <p className="text-xs text-emerald-700 font-bold">
                  Вам присвоен статус «Проверенный арендатор АЗКК» 🛡️
                </p>
              </div>
              <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/50 p-4 space-y-3 text-xs leading-5">
                <p className="font-extrabold text-[#111111]">Подтвержденные данные:</p>
                <div className="grid grid-cols-2 gap-y-2 text-muted-foreground">
                  <div>ФИО:</div>
                  <div className="font-bold text-[#111111]">{profile?.display_name || "Пользователь"}</div>
                  <div>Возраст:</div>
                  <div className="font-bold text-[#111111]">{profile?.age ? `${profile.age} лет` : "—"}</div>
                  <div>Паспорт РФ:</div>
                  <div className="font-bold text-emerald-700">Действителен</div>
                  <div>Исполнительные дела (ФССП):</div>
                  <div className="font-bold text-emerald-700">Не обнаружены</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetVerification}
                className="w-full border border-red-200 hover:bg-red-50 text-red-600 rounded-full py-3 text-xs font-extrabold transition-colors flex items-center justify-center gap-2"
              >
                Сбросить верификацию (для повторного теста)
              </button>
            </section>
          )}
        </div>
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
                className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
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
                className="w-full sm:w-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
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
              Это действие необратимо. Все ваши данные, анкеты, сообщения и история будут удалены навсегда.
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