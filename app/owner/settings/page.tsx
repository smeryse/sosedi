"use client";

import { useState } from "react";
import { Bell, LockKeyhole, Settings2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { PageFrame } from "@/components/tenant/page-frame";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateOwnerSettings } from "@/app/actions/settings";

const initialOwnerSettings = {
  newApplications: true,
  quickReplies: true,
  phoneVerification: false,
};

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState(initialOwnerSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await updateOwnerSettings(settings, "owner");
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Ошибка сохранения. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const settingsSections = [
    {
      title: "Уведомления о заявках",
      description: "Получать письмо о новых откликах",
      icon: Bell,
      key: "newApplications" as keyof typeof settings,
    },
    {
      title: "Быстрые ответы",
      description: "Сохранять шаблоны сообщений",
      icon: Settings2,
      key: "quickReplies" as keyof typeof settings,
    },
    {
      title: "Безопасность",
      description: "Подтверждение телефона и активные сессии",
      icon: LockKeyhole,
      key: "phoneVerification" as keyof typeof settings,
    },
  ] as const;

  return (
    <PageFrame title="Настройки" description="Уведомления и безопасность кабинета собственника.">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-3">
        {settingsSections.map(({ title, description, icon: Icon, key }) => (
          <div key={key} className="surface-card flex items-center gap-4 p-5">
            <div className="grid size-10 place-items-center rounded-full bg-surface-muted">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
              checked={settings[key]}
              onCheckedChange={v => handleChange(key, v)}
              disabled={isLoading}
            />
          </div>
        ))}

        {submitStatus === "success" && (
          <div className="flex items-center gap-3 rounded-full bg-green-50 px-4 py-3 text-green-700" role="status">
            <ShieldCheck className="size-5" />
            <span className="font-bold">Настройки сохранены</span>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="flex items-center gap-3 rounded-full bg-red-50 px-4 py-3 text-red-700" role="alert">
            <AlertCircle className="size-5" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || submitStatus === "success"}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Сохранение...
            </>
          ) : submitStatus === "success" ? (
            "Сохранено"
          ) : (
            "Сохранить изменения"
          )}
        </Button>
      </form>
    </PageFrame>
  );
}