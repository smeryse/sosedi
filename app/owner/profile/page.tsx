"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Check, ShieldCheck, Loader2, AlertCircle, Save } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { getCurrentUser, updateProfile, uploadAvatar } from "@/app/actions/settings";
import { createClient } from "@/lib/supabase/client";

export default function OwnerProfilePage() {
  const [profile, setProfile] = useState<{
    display_name: string;
    age: number;
    job_title: string;
    bio: string;
    city: string;
    is_public: boolean;
    avatar_path: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function loadProfile() {
    try {
      const data = await getCurrentUser();
      if (data) {
        setProfile(data);
        if (data.avatar_path) setAvatarPreview(data.avatar_path);
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

  return (
    <PageFrame
      eyebrow="Ваш профиль"
      title={loading ? "Загрузка..." : profile?.display_name || "Профиль"}
      description="Информация, которую видят арендаторы. Контакты остаются скрытыми до взаимного согласия."
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
    </PageFrame>
  );
}