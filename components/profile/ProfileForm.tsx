"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  budget: string;
  moveInDate: string;
  stayDuration: string;
  profession: string;
  habits: string[];
}

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

const cities = [
  "Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск",
  "Краснодар", "Ростов-на-Дону", "Уфа", "Красноярск", "Воронеж",
  "Пермь", "Волгоград", "Самара", "Омск", "Челябинск"
];

const stayDurations = [
  "от 3 месяцев", "от 6 месяцев", "от 9 месяцев", "от 12 месяцев",
  "от 18 месяцев", "от 24 месяцев", "длительно (2+ года)"
];

const professions = [
  "IT / Разработка", "Маркетинг / Реклама", "Дизайн / Креатив", "Финансы / Бухгалтерия",
  "Продажи / Менеджмент", "Образование / Наука", "Медицина / Фармацевтика",
  "Строительство / Архитектура", "Гостиничный бизнес / HoReCa", "Логистика / Транспорт",
  "Юриспруденция", "HR / Рекрутинг", "Студент", "Фриланс / Самостоятельная работа", "Другое"
];

const habitOptions = [
  "Не курю", "Люблю порядок", "Работаю из дома", "Тихие вечера",
  "Спорт / Йога", "Кино / Сериалы", "Готовлю дома", "Ранний подъём",
  "Поздний заход", "Есть питомцы", "Часто в гостях", "Минимализм"
];

export function ProfileForm({ initialData, onSubmit, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = (data: ProfileFormData): Partial<ProfileFormData> => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!data.firstName.trim()) newErrors.firstName = "Имя обязательно";
    if (!data.lastName.trim()) newErrors.lastName = "Фамилия обязательна";
    if (!data.email.trim()) newErrors.email = "Email обязателен";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = "Некорректный email";
    if (!data.phone.trim()) newErrors.phone = "Телефон обязателен";
    else if (!/^\+?[78]\d{10}$/.test(data.phone.replace(/\D/g, ""))) newErrors.phone = "Некорректный номер";
    if (!data.city.trim()) newErrors.city = "Выберите город";
    if (!data.budget.trim()) newErrors.budget = "Укажите бюджет";

    return newErrors;
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleHabitsChange = (habits: string[]) => {
    setFormData(prev => ({ ...prev, habits }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await onSubmit(formData);
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Ошибка сохранения. Попробуйте позже.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="text-xs font-extrabold">
            Имя
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={e => handleChange("firstName", e.target.value)}
            className="mt-2 h-11 rounded-[14px] border bg-background px-3 text-sm"
            placeholder="Анна"
            disabled={isLoading}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="mt-1 text-[11px] text-red-600" role="alert">
              {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName" className="text-xs font-extrabold">
            Фамилия
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={e => handleChange("lastName", e.target.value)}
            className="mt-2 h-11 rounded-[14px] border bg-background px-3 text-sm"
            placeholder="Смирнова"
            disabled={isLoading}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="mt-1 text-[11px] text-red-600" role="alert">
              {errors.lastName}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="email" className="text-xs font-extrabold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => handleChange("email", e.target.value)}
            className="mt-2 h-11 rounded-[14px] border bg-background px-3 text-sm"
            placeholder="anna@example.com"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-[11px] text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="phone" className="text-xs font-extrabold">
            Телефон
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={e => handleChange("phone", e.target.value)}
            className="mt-2 h-11 rounded-[14px] border bg-background px-3 text-sm"
            placeholder="+7 900 000-00-00"
            disabled={isLoading}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-[11px] text-red-600" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="city" className="text-xs font-extrabold">
            Город
          </Label>
          <Select value={formData.city} onValueChange={(v: string) => handleChange("city", v)} disabled={isLoading}>
            <SelectTrigger className="mt-2 h-11 rounded-[14px] border bg-background">
              <SelectValue placeholder="Выберите город" />
            </SelectTrigger>
            <SelectContent>
              {cities.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="mt-1 text-[11px] text-red-600" role="alert">
              {errors.city}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="profession" className="text-xs font-extrabold">
            Профессия / Сфера деятельности
          </Label>
          <Select value={formData.profession} onValueChange={(v: string) => handleChange("profession", v)} disabled={isLoading}>
            <SelectTrigger className="mt-2 h-11 rounded-[14px] border bg-background">
              <SelectValue placeholder="Выберите профессию" />
            </SelectTrigger>
            <SelectContent>
              {professions.map(prof => (
                <SelectItem key={prof} value={prof}>
                  {prof}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="bio" className="text-xs font-extrabold">
            О себе
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={e => handleChange("bio", e.target.value)}
            className="mt-2 h-24 rounded-[14px] border bg-background p-3 text-sm resize-none"
            placeholder="Расскажите о себе: хобби, образ жизни, что важно в соседстве..."
            disabled={isLoading}
            maxLength={500}
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {formData.bio.length}/500
          </p>
        </div>
      </div>

      <section className="space-y-4 border-t pt-6">
        <h3 className="font-extrabold">Параметры поиска</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="budget" className="text-xs font-extrabold">
              Бюджет в месяц
            </Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={e => handleChange("budget", e.target.value)}
              className="mt-2 h-11 rounded-[14px] border bg-background px-3 text-sm"
              placeholder="до 30 000 ₽"
              disabled={isLoading}
              aria-invalid={!!errors.budget}
              aria-describedby={errors.budget ? "budget-error" : undefined}
            />
            {errors.budget && (
              <p id="budget-error" className="mt-1 text-[11px] text-red-600" role="alert">
                {errors.budget}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="moveInDate" className="text-xs font-extrabold">
              Желаемая дата переезда
            </Label>
            <Input
              id="moveInDate"
              type="month"
              value={formData.moveInDate}
              onChange={e => handleChange("moveInDate", e.target.value)}
              className="mt-2 h-11 rounded-[14px] border bg-background px-3 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="stayDuration" className="text-xs font-extrabold">
              Срок аренды
            </Label>
            <Select value={formData.stayDuration} onValueChange={(v: string) => handleChange("stayDuration", v)} disabled={isLoading}>
              <SelectTrigger className="mt-2 h-11 rounded-[14px] border bg-background">
                <SelectValue placeholder="Выберите срок" />
              </SelectTrigger>
              <SelectContent>
                {stayDurations.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="font-extrabold">Привычки и предпочтения</h3>
        <p className="text-sm text-muted-foreground">
          Выберите до 6 вариантов. Это поможет найти идеальных соседей.
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Привычки">
          {habitOptions.map(habit => (
            <button
              key={habit}
              type="button"
              onClick={() => {
                const newHabits = formData.habits.includes(habit)
                  ? formData.habits.filter(h => h !== habit)
                  : [...formData.habits, habit].slice(0, 6);
                handleHabitsChange(newHabits);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                formData.habits.includes(habit)
                  ? "bg-[hsl(var(--accent))] text-white"
                  : "bg-surface-muted text-foreground hover:bg-surface"
              }`}
              disabled={isLoading || (!formData.habits.includes(habit) && formData.habits.length >= 6)}
              aria-pressed={formData.habits.includes(habit)}
            >
              {formData.habits.includes(habit) && (
                <ShieldCheck className="size-3.5" />
              )}
              {habit}
            </button>
          ))}
        </div>
        {formData.habits.length >= 6 && (
          <p className="text-[11px] text-[hsl(var(--accent-hover))] font-bold">
            Максимум 6 привычек выбрано
          </p>
        )}
      </section>

      {submitStatus === "success" && (
        <div className="flex items-center gap-3 rounded-full bg-green-50 px-4 py-3 text-green-700" role="status">
          <ShieldCheck className="size-5" />
          <span className="font-bold">Профиль успешно сохранён</span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="flex items-center gap-3 rounded-full bg-red-50 px-4 py-3 text-red-700" role="alert">
          <AlertCircle className="size-5" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" disabled={isLoading}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading || submitStatus === "success"}>
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
      </div>
    </form>
  );
}