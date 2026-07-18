"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, AlertCircle, Bell, LockKeyhole, Palette, Shield, Eye, UserRound, Mail, Smartphone, Moon, Sun, Monitor, Globe, Wifi, Layers, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Section = "notifications" | "security" | "appearance" | "privacy";

interface SettingsFormProps {
  section: Section;
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newMessages: boolean;
    newApplications: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
  };
  securitySettings: {
    currentPassword: string;
    newPassword: string;
    twoFactorEnabled: boolean;
  };
  appearanceSettings: {
    theme: "light" | "dark" | "system";
    language: "ru" | "en";
  };
  onNotificationChange: (key: string, value: boolean) => void;
  onSecurityChange: (key: string, value: string | boolean) => void;
  onAppearanceChange: (key: string, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  submitStatus: "idle" | "success" | "error";
  errorMessage: string;
}

export function SettingsForm({
  section,
  notificationSettings,
  securitySettings,
  appearanceSettings,
  onNotificationChange,
  onSecurityChange,
  onAppearanceChange,
  onSubmit,
  isLoading,
  submitStatus,
  errorMessage,
}: SettingsFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-6" noValidate>
      {section === "notifications" && (
        <div className="space-y-6">
          <div className="surface-card rounded-[20px] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Bell className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Каналы доставки</h3>
                <p className="text-sm text-muted-foreground">Как вы хотите получать уведомления</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-bold">Email-уведомления</p>
                    <p className="text-sm text-muted-foreground">Получать письма на почту</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={v => onNotificationChange("emailNotifications", v)}
                  disabled={isLoading}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Smartphone className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-bold">Push-уведомления</p>
                    <p className="text-sm text-muted-foreground">Уведомления в браузере и приложении</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={v => onNotificationChange("pushNotifications", v)}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          <div className="surface-card rounded-[20px] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Bell className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Типы уведомлений</h3>
                <p className="text-sm text-muted-foreground">Что именно вы хотите получать</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              {[
                { key: "newMessages", label: "Новые сообщения", desc: "Когда вам пишут в чате" },
                { key: "newApplications", label: "Новые заявки и отклики", desc: "На ваши объявления или в ваши группы" },
                { key: "marketingEmails", label: "Маркетинговые письма", desc: "Новости, советы и спецпредложения" },
                { key: "weeklyDigest", label: "Еженедельный дайджест", desc: "Сводка активности за неделю" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[key as keyof typeof notificationSettings]}
                    onCheckedChange={v => onNotificationChange(key, v)}
                    disabled={isLoading}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "security" && (
        <div className="space-y-6">
          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <LockKeyhole className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Смена пароля</h3>
                <p className="text-sm text-muted-foreground">Ваш текущий пароль должен быть сложным и уникальным</p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div>
                <Label htmlFor="currentPassword" className="text-xs font-extrabold">
                  Текущий пароль
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={securitySettings.currentPassword}
                    onChange={e => onSecurityChange("currentPassword", e.target.value)}
                    className="h-11 rounded-[14px] border bg-background px-3 text-sm pr-12"
                    placeholder="Введите текущий пароль"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showCurrentPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showCurrentPassword ? <Eye className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-xs font-extrabold">
                  Новый пароль
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={securitySettings.newPassword}
                    onChange={e => onSecurityChange("newPassword", e.target.value)}
                    className="h-11 rounded-[14px] border bg-background px-3 text-sm pr-12"
                    placeholder="Минимум 8 символов"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showNewPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showNewPassword ? <Eye className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Минимум 8 символов, заглавная буква, цифра и спецсимвол
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Shield className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Двухфакторная аутентификация</h3>
                <p className="text-sm text-muted-foreground">Дополнительный уровень защиты аккаунта</p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold">Включить 2FA</p>
                  <p className="text-sm text-muted-foreground">Требуется код из приложения-аутентификатора при входе</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={v => onSecurityChange("twoFactorEnabled", v)}
                  disabled={isLoading}
                />
              </label>

              <div className="flex items-center gap-3 rounded-xl border bg-surface-muted p-4">
                <div className="grid size-10 place-items-center rounded-full bg-surface">
                  <Smartphone className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Приложения-аутентификаторы</p>
                  <p className="text-sm text-muted-foreground">
                    Google Authenticator, Authy, 1Password, Microsoft Authenticator
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-red-50">
                <AlertCircle className="size-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold">Активные сессии</h3>
                <p className="text-sm text-muted-foreground">Управляйте устройствами, вошедшими в ваш аккаунт</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              {[
                { device: "iPhone 15 Pro", location: "Краснодар, Россия", current: true, time: "Сейчас" },
                { device: "MacBook Pro (Chrome)", location: "Краснодар, Россия", current: false, time: "2 часа назад" },
                { device: "Windows PC (Firefox)", location: "Москва, Россия", current: false, time: "3 дня назад" },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-surface">
                      <Smartphone className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent-soft))] px-2 py-0.5 text-[10px] font-extrabold">
                            Текущее
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{session.location} · {session.time}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Завершить
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "appearance" && (
        <div className="space-y-6">
          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Palette className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Тема оформления</h3>
                <p className="text-sm text-muted-foreground">Выберите внешний вид интерфейса</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 border-t pt-6">
              {[
                { value: "light", label: "Светлая", icon: Sun, desc: "Всегда светлая тема" },
                { value: "dark", label: "Тёмная", icon: Moon, desc: "Всегда тёмная тема" },
                { value: "system", label: "Системная", icon: Monitor, desc: "Следовать настройкам ОС" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onAppearanceChange("theme", value)}
                  className={`relative flex flex-col items-center gap-2 rounded-[18px] border-2 p-5 transition-all ${
                    appearanceSettings.theme === value
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent-soft))]"
                      : "border-surface hover:border-muted"
                  }`}
                  disabled={isLoading}
                >
                  <Icon className={`size-7 ${
                    appearanceSettings.theme === value ? "text-[hsl(var(--accent-hover))]" : "text-muted-foreground"
                  }`} />
                  <span className="font-bold">{label}</span>
                  <p className="text-[11px] text-center text-muted-foreground">{desc}</p>
                  {appearanceSettings.theme === value && (
                    <div className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-[hsl(var(--accent))]">
                      <ShieldCheck className="size-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Globe className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Язык интерфейса</h3>
                <p className="text-sm text-muted-foreground">Выберите предпочитаемый язык</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <Select value={appearanceSettings.language} onValueChange={v => onAppearanceChange("language", v)} disabled={isLoading}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Выберите язык" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "ru", label: "Русский" },
                    { value: "en", label: "English" },
                  ].map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Eye className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Дополнительные настройки</h3>
                <p className="text-sm text-muted-foreground">Настройки отображения контента</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold">Компактный режим</p>
                  <p className="text-sm text-muted-foreground">Уменьшить отступы и размеры элементов</p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} disabled={isLoading} />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold">Анимации</p>
                  <p className="text-sm text-muted-foreground">Включить плавные переходы и эффекты</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} disabled={isLoading} />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold">Показывать аватарки в списках</p>
                  <p className="text-sm text-muted-foreground">Отображать фото пользователей в чатах и каталогах</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} disabled={isLoading} />
              </label>
            </div>
          </div>
        </div>
      )}

      {section === "privacy" && (
        <div className="space-y-6">
          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Eye className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Видимость профиля</h3>
                <p className="text-sm text-muted-foreground">Кто может видеть ваш профиль и информацию</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              {[
                { key: "profileVisibility", label: "Профиль в поиске", desc: "Показывать профиль в поиске соседей и жилья" },
                { key: "showPhone", label: "Телефон", desc: "Показывать телефон после взаимного согласия" },
                { key: "showEmail", label: "Email", desc: "Показывать email после взаимного согласия" },
                { key: "showLastActive", label: "Последний вход", desc: "Показывать время последней активности" },
                { key: "showOnlineStatus", label: "Статус онлайн", desc: "Показывать, когда вы в сети" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={key !== "showEmail" && key !== "showPhone"}
                    onCheckedChange={() => {}}
                    disabled={isLoading}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <Shield className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Данные и активность</h3>
                <p className="text-sm text-muted-foreground">Управление вашими данными</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Mail className="size-5" />
                <span>Скачать мои данные</span>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 border-red-200">
                <AlertCircle className="size-5" />
                <span>Удалить аккаунт</span>
              </Button>
            </div>
          </div>

          <div className="surface-card rounded-[20px] p-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[hsl(var(--accent-soft))]">
                <UserRound className="size-5 text-[hsl(var(--accent-hover))]" />
              </div>
              <div>
                <h3 className="font-extrabold">Персонализация и реклама</h3>
                <p className="text-sm text-muted-foreground">Как мы используем ваши данные для улучшения сервиса</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              {[
                { label: "Персональные рекомендации", desc: "На основе вашей активности подбирать соседей и жильё" },
                { label: "Аналитика использования", desc: "Анонимная статистика для улучшения сервиса" },
                { label: "Маркетинговые сообщения", desc: "Получать актуальные предложения и новости" },
              ].map((item, i) => (
                <label key={i} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={i !== 2} onCheckedChange={() => {}} disabled={isLoading} />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {(submitStatus === "success" || submitStatus === "error") && (
        <div className={`flex items-center gap-3 rounded-full px-4 py-3 ${
          submitStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`} role={submitStatus === "success" ? "status" : "alert"}>
          {submitStatus === "success" ? <ShieldCheck className="size-5" /> : <AlertCircle className="size-5" />}
          <span className="font-bold">
            {submitStatus === "success" ? "Настройки успешно сохранены" : errorMessage}
          </span>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isLoading || submitStatus === "success"}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Сохранение...
            </>
          ) : submitStatus === "success" ? (
            "Сохранено"
          ) : (
            "Сохранить настройки"
          )}
        </Button>
      </div>
    </form>
  );
}