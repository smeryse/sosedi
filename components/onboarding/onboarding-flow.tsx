"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AirVent,
  Armchair,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bath,
  Building2,
  Camera,
  CarFront,
  Check,
  ChevronDown,
  CircleAlert,
  FileText,
  Home,
  ImageIcon,
  KeyRound,
  Layers,
  LoaderCircle,
  MapPin,
  Monitor,
  PartyPopper,
  Plus,
  Refrigerator,
  Ruler,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  Utensils,
  Wallet,
  WashingMachine,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type OnboardingRole = "tenant" | "landlord";

interface OnboardingFlowProps {
  role?: OnboardingRole;
}

type YesNo = "" | "yes" | "no";
type AlcoholFrequency = "" | "never" | "sometimes" | "often";
type GuestFrequency = "" | "never" | "rarely" | "often";
type Schedule = "" | "early" | "flexible" | "late";
type Utilities = "" | "included" | "separate";
type LeaseTerm = "" | "6" | "11" | "12_plus" | "flexible";

interface TenantDraft {
  contact: {
    name: string;
    phone: string;
    age: string;
    city: string;
  };
  hobbies: string[];
  habits: {
    smoking: YesNo;
    alcohol: AlcoholFrequency;
    pets: YesNo;
    guests: GuestFrequency;
    schedule: Schedule;
  };
  districts: string[];
  budget: {
    min: string;
    max: string;
  };
}

interface LandlordDraft {
  property: {
    address: string;
    type: string;
    rooms: string;
    area: string;
    floor: string;
  };
  terms: {
    rent: string;
    deposit: string;
    utilities: Utilities;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    lease: LeaseTerm;
  };
  amenities: string[];
  details: {
    description: string;
    buildingType: string;
    year: string;
  };
}

interface PhotoItem {
  id: string;
  file: File;
  url: string;
}

interface StepInfo {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

interface Choice {
  value: string;
  label: string;
  description?: string;
}

interface ChoiceGroupProps {
  legend: string;
  value: string;
  choices: Choice[];
  onChange: (value: string) => void;
  error?: string;
  fieldId: string;
  compact?: boolean;
}

interface ProgressProps {
  steps: StepInfo[];
  currentStep: number;
  highestStep: number;
  onSelect: (step: number) => void;
}

interface TenantStepProps {
  step: number;
  draft: TenantDraft;
  errors: Record<string, string>;
  districtQuery: string;
  customHobby: string;
  onDistrictQueryChange: (value: string) => void;
  onCustomHobbyChange: (value: string) => void;
  onAddCustomHobby: () => void;
  onContactChange: (field: keyof TenantDraft["contact"], value: string) => void;
  onHabitChange: (field: keyof TenantDraft["habits"], value: string) => void;
  onToggleHobby: (hobby: string) => void;
  onToggleDistrict: (district: string) => void;
  onBudgetChange: (field: keyof TenantDraft["budget"], value: string) => void;
}

interface LandlordStepProps {
  step: number;
  draft: LandlordDraft;
  errors: Record<string, string>;
  photos: PhotoItem[];
  onPropertyChange: (
    field: keyof LandlordDraft["property"],
    value: string,
  ) => void;
  onTermChange: (
    field: keyof LandlordDraft["terms"],
    value: string | boolean,
  ) => void;
  onToggleAmenity: (amenity: string) => void;
  onDetailsChange: (
    field: keyof LandlordDraft["details"],
    value: string,
  ) => void;
  onPhotosChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (id: string) => void;
}

interface SummaryProps {
  role: OnboardingRole;
  tenant: TenantDraft;
  landlord: LandlordDraft;
  photos: PhotoItem[];
  compact?: boolean;
}

interface ApiResponse {
  destination?: string;
  propertyId?: string;
  id?: string;
  data?: {
    id?: string;
  };
  error?: {
    message?: string;
  };
  message?: string;
}

const DRAFT_VERSION = 1;
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const TENANT_STEPS: StepInfo[] = [
  {
    id: "contacts",
    label: "Контакты",
    title: "Расскажите о себе",
    description: "Эти данные увидят только подтверждённые пользователи.",
    icon: UserRound,
  },
  {
    id: "lifestyle",
    label: "Ритм жизни",
    title: "Хобби и привычки",
    description:
      "Ответы помогут точнее подобрать людей, с которыми будет комфортно жить.",
    icon: UsersRound,
  },
  {
    id: "districts",
    label: "Районы",
    title: "Где вы хотите жить",
    description:
      "Выберите один или несколько районов для будущих рекомендаций.",
    icon: MapPin,
  },
  {
    id: "budget",
    label: "Бюджет",
    title: "Комфортный бюджет",
    description: "Укажите сумму за вашу часть аренды в месяц.",
    icon: Wallet,
  },
];

const LANDLORD_STEPS: StepInfo[] = [
  {
    id: "property",
    label: "Объект",
    title: "Основные данные",
    description: "Расскажите, какое жильё вы предлагаете.",
    icon: Home,
  },
  {
    id: "photos",
    label: "Фотографии",
    title: "Покажите квартиру",
    description: "Живые и светлые фотографии помогают быстрее найти жильцов.",
    icon: Camera,
  },
  {
    id: "terms",
    label: "Условия",
    title: "Условия аренды",
    description: "Цена, залог и важные правила проживания.",
    icon: KeyRound,
  },
  {
    id: "amenities",
    label: "Оснащение",
    title: "Что есть в квартире",
    description: "Отметьте всё, чем смогут пользоваться жильцы.",
    icon: Armchair,
  },
  {
    id: "details",
    label: "О доме",
    title: "Последние детали",
    description: "Добавьте описание, чтобы объявление звучало по-человечески.",
    icon: Building2,
  },
];

const DEFAULT_TENANT: TenantDraft = {
  contact: { name: "", phone: "", age: "", city: "" },
  hobbies: [],
  habits: { smoking: "", alcohol: "", pets: "", guests: "", schedule: "" },
  districts: [],
  budget: { min: "25000", max: "50000" },
};

const DEFAULT_LANDLORD: LandlordDraft = {
  property: { address: "", type: "Квартира", rooms: "", area: "", floor: "" },
  terms: {
    rent: "",
    deposit: "",
    utilities: "",
    petsAllowed: false,
    smokingAllowed: false,
    lease: "",
  },
  amenities: [],
  details: { description: "", buildingType: "", year: "" },
};

const HOBBIES = [
  "Спорт",
  "Музыка",
  "Кино",
  "Чтение",
  "Игры",
  "Путешествия",
  "Готовка",
  "Искусство",
  "Технологии",
  "Прогулки",
];

const DISTRICTS = [
  "Центральный",
  "Василеостровский",
  "Петроградский",
  "Адмиралтейский",
  "Московский",
  "Приморский",
  "Выборгский",
  "Невский",
  "Фрунзенский",
  "Калининский",
];

const AMENITIES: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "furniture", label: "Мебель", icon: Armchair },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "washer", label: "Стиральная машина", icon: WashingMachine },
  { id: "fridge", label: "Холодильник", icon: Refrigerator },
  { id: "air_conditioner", label: "Кондиционер", icon: AirVent },
  { id: "dishwasher", label: "Посудомоечная машина", icon: Utensils },
  { id: "parking", label: "Парковка", icon: CarFront },
  { id: "bath", label: "Ванна", icon: Bath },
  { id: "workspace", label: "Рабочее место", icon: Monitor },
];

const inputClassName =
  "mt-2 min-h-12 w-full rounded-[16px] border border-[#DDDED7] bg-[#FFFFFC] px-4 text-[15px] font-medium text-[#111111] outline-none transition placeholder:text-[#8A8D84] hover:border-[#BEC0B7] focus:border-[#95B800] focus:ring-4 focus:ring-[#B3DB00]/15 disabled:cursor-not-allowed disabled:opacity-60";

const selectClassName = cn(inputClassName, "appearance-none pr-11");

function clampStep(value: unknown, total: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(Math.trunc(parsed), 0), total - 1);
}

function draftStorageKey(role: OnboardingRole) {
  return `sosedi-onboarding-v${DRAFT_VERSION}-${role}`;
}

function parseNumber(value: string) {
  return Number(value.replace(/[^\d]/g, ""));
}

function formatRubles(value: string | number) {
  const numeric = typeof value === "number" ? value : parseNumber(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "Не указано";
  return `${numeric.toLocaleString("ru-RU")} ₽`;
}

function safeFileName(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-zа-яё0-9._-]+/gi, "-");
  return cleaned.slice(-80) || "photo.jpg";
}

function getFirstError(errors: Record<string, string>) {
  return Object.keys(errors)[0];
}

function focusError(field: string | undefined) {
  if (!field) return;
  window.requestAnimationFrame(() => {
    document.getElementById(`field-${field}`)?.focus();
  });
}

function hasErrors(errors: Record<string, string>) {
  return Object.keys(errors).length > 0;
}

function normalizeTenantDraft(value: unknown): TenantDraft {
  if (!value || typeof value !== "object") return DEFAULT_TENANT;
  const draft = value as Partial<TenantDraft>;
  return {
    contact: { ...DEFAULT_TENANT.contact, ...(draft.contact ?? {}) },
    hobbies: Array.isArray(draft.hobbies)
      ? draft.hobbies.filter((item): item is string => typeof item === "string")
      : [],
    habits: { ...DEFAULT_TENANT.habits, ...(draft.habits ?? {}) },
    districts: Array.isArray(draft.districts)
      ? draft.districts.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    budget: { ...DEFAULT_TENANT.budget, ...(draft.budget ?? {}) },
  };
}

function normalizeLandlordDraft(value: unknown): LandlordDraft {
  if (!value || typeof value !== "object") return DEFAULT_LANDLORD;
  const draft = value as Partial<LandlordDraft>;
  return {
    property: { ...DEFAULT_LANDLORD.property, ...(draft.property ?? {}) },
    terms: { ...DEFAULT_LANDLORD.terms, ...(draft.terms ?? {}) },
    amenities: Array.isArray(draft.amenities)
      ? draft.amenities.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    details: { ...DEFAULT_LANDLORD.details, ...(draft.details ?? {}) },
  };
}

function validateTenantStep(step: number, draft: TenantDraft) {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (draft.contact.name.trim().length < 2)
      errors.name = "Укажите имя и фамилию.";
    if (draft.contact.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Введите телефон минимум из 10 цифр.";
    }
    const age = Number(draft.contact.age);
    if (!Number.isInteger(age) || age < 18 || age > 100) {
      errors.age = "Возраст должен быть от 18 до 100 лет.";
    }
    if (draft.contact.city.trim().length < 2)
      errors.city = "Укажите город поиска.";
  }

  if (step === 1) {
    if (draft.hobbies.length < 2)
      errors.hobbies = "Выберите хотя бы два интереса.";
    if (!draft.habits.smoking) errors.smoking = "Выберите вариант.";
    if (!draft.habits.alcohol) errors.alcohol = "Выберите вариант.";
    if (!draft.habits.pets) errors.pets = "Выберите вариант.";
    if (!draft.habits.guests) errors.guests = "Выберите вариант.";
    if (!draft.habits.schedule) errors.schedule = "Выберите вариант.";
  }

  if (step === 2 && draft.districts.length === 0) {
    errors.districts = "Выберите хотя бы один район.";
  }

  if (step === 3) {
    const min = parseNumber(draft.budget.min);
    const max = parseNumber(draft.budget.max);
    if (min < 5_000) errors.budgetMin = "Минимальный бюджет — 5 000 ₽.";
    if (max > 1_000_000 || max < 6_000)
      errors.budgetMax = "Укажите корректный максимум.";
    if (min >= max) errors.budgetMax = "Максимум должен быть больше минимума.";
  }

  return errors;
}

function validateLandlordStep(
  step: number,
  draft: LandlordDraft,
  photoCount: number,
) {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (draft.property.address.trim().length < 6)
      errors.address = "Укажите полный адрес.";
    if (!draft.property.type) errors.propertyType = "Выберите тип жилья.";
    const rooms = Number(draft.property.rooms);
    if (!Number.isInteger(rooms) || rooms < 1 || rooms > 20) {
      errors.rooms = "Укажите количество комнат от 1 до 20.";
    }
    const area = Number(draft.property.area);
    if (!Number.isFinite(area) || area < 8 || area > 1_000) {
      errors.area = "Укажите площадь от 8 до 1 000 м².";
    }
    if (draft.property.floor.trim().length < 1) errors.floor = "Укажите этаж.";
  }

  if (step === 1 && photoCount === 0) {
    errors.photos = "Добавьте хотя бы одну фотографию.";
  }

  if (step === 2) {
    if (parseNumber(draft.terms.rent) < 1_000)
      errors.rent = "Укажите стоимость аренды.";
    if (!draft.terms.deposit || parseNumber(draft.terms.deposit) < 0) {
      errors.deposit = "Укажите залог, можно 0 ₽.";
    }
    if (!draft.terms.utilities) errors.utilities = "Выберите вариант оплаты.";
    if (!draft.terms.lease) errors.lease = "Выберите срок аренды.";
  }

  if (step === 3 && draft.amenities.length === 0) {
    errors.amenities = "Отметьте хотя бы один пункт.";
  }

  if (step === 4) {
    if (draft.details.description.trim().length < 30) {
      errors.description = "Добавьте описание минимум из 30 символов.";
    }
    if (!draft.details.buildingType) errors.buildingType = "Выберите тип дома.";
    const year = Number(draft.details.year);
    const nextYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(year) || year < 1700 || year > nextYear) {
      errors.year = `Укажите год от 1700 до ${nextYear}.`;
    }
  }

  return errors;
}

async function uploadPropertyPhotos(photos: PhotoItem[], propertyId: string) {
  const uploads = photos.map(async ({ file }, index) => {
    const body = new FormData();
    body.append("file", file);
    body.append("bucket", "property-images");
    body.append(
      "path",
      `onboarding/${propertyId}/${Date.now()}-${index + 1}-${safeFileName(file.name)}`,
    );
    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body,
    });
    if (!response.ok) throw new Error("Photo upload failed");
  });

  await Promise.allSettled(uploads);
}

function Field({ id, label, error, hint, children }: FieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="min-w-0">
      <label
        htmlFor={`field-${id}`}
        className="text-[13px] font-bold text-[#20201E]"
      >
        {label}
      </label>
      <div aria-describedby={descriptionId}>{children}</div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A53A35]"
        >
          <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-[#70736B]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ChoiceGroup({
  legend,
  value,
  choices,
  onChange,
  error,
  fieldId,
  compact = false,
}: ChoiceGroupProps) {
  return (
    <fieldset
      id={`field-${fieldId}`}
      tabIndex={-1}
      className="min-w-0 outline-none"
    >
      <legend className="text-[13px] font-bold text-[#20201E]">{legend}</legend>
      <div
        role="radiogroup"
        aria-label={legend}
        className={cn(
          "mt-2 grid gap-2",
          compact ? "grid-cols-2 sm:flex sm:flex-wrap" : "sm:grid-cols-3",
        )}
      >
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(choice.value)}
              className={cn(
                "min-h-12 rounded-[15px] border px-3.5 text-left text-[13px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#95B800] focus-visible:ring-offset-2",
                selected
                  ? "border-[#95B800] bg-[#EBF7B6] text-[#111111]"
                  : "border-[#DDDED7] bg-[#FFFFFC] text-[#565950] hover:border-[#B3DB00] hover:bg-[#F8FBEA]",
                compact && "text-center sm:min-w-[88px]",
              )}
            >
              <span className="block">{choice.label}</span>
              {choice.description ? (
                <span className="mt-1 block text-[11px] font-medium leading-4 text-[#73766E]">
                  {choice.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A53A35]">
          <CircleAlert className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function FlowProgress({
  steps,
  currentStep,
  highestStep,
  onSelect,
}: ProgressProps) {
  return (
    <nav aria-label="Этапы регистрации" className="lg:sticky lg:top-24">
      <ol className="flex items-start gap-1.5 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {steps.map((item, index) => {
          const Icon = item.icon;
          const active = index === currentStep;
          const complete = index < highestStep;
          const reachable = index <= highestStep;

          return (
            <li key={item.id} className="min-w-[76px] flex-1 lg:min-w-0">
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                onClick={() => onSelect(index)}
                className={cn(
                  "group w-full rounded-[18px] border px-2 py-3 text-center outline-none transition lg:flex lg:items-center lg:gap-3 lg:px-3.5 lg:text-left",
                  active
                    ? "border-[#95B800] bg-[#EBF7B6]"
                    : "border-transparent bg-transparent hover:border-[#DDDED7] hover:bg-[#FFFFFC]",
                  !reachable &&
                    "cursor-not-allowed opacity-45 hover:border-transparent hover:bg-transparent",
                )}
              >
                <span
                  className={cn(
                    "mx-auto grid size-8 shrink-0 place-items-center rounded-full border text-xs font-black transition lg:mx-0",
                    active
                      ? "border-[#111111] bg-[#B3DB00] text-[#111111]"
                      : complete
                        ? "border-[#95B800] bg-[#EBF7B6] text-[#111111]"
                        : "border-[#DDDED7] bg-[#FFFFFC] text-[#777A72]",
                  )}
                >
                  {complete ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Icon className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="mt-1.5 block truncate text-[10px] font-extrabold lg:mt-0 lg:text-xs">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function TenantStep({
  step,
  draft,
  errors,
  districtQuery,
  customHobby,
  onDistrictQueryChange,
  onCustomHobbyChange,
  onAddCustomHobby,
  onContactChange,
  onHabitChange,
  onToggleHobby,
  onToggleDistrict,
  onBudgetChange,
}: TenantStepProps) {
  const filteredDistricts = DISTRICTS.filter((district) =>
    district.toLowerCase().includes(districtQuery.trim().toLowerCase()),
  );

  if (step === 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Имя и фамилия" error={errors.name}>
          <input
            id="field-name"
            name="name"
            autoComplete="name"
            value={draft.contact.name}
            onChange={(event) => onContactChange("name", event.target.value)}
            placeholder="Иван Иванов"
            className={inputClassName}
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field
          id="phone"
          label="Телефон"
          error={errors.phone}
          hint="Нужен для связи после взаимного интереса."
        >
          <input
            id="field-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={draft.contact.phone}
            onChange={(event) => onContactChange("phone", event.target.value)}
            placeholder="+7 999 123-45-67"
            className={inputClassName}
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
        <Field id="age" label="Возраст" error={errors.age}>
          <input
            id="field-age"
            name="age"
            type="number"
            min="18"
            max="100"
            inputMode="numeric"
            value={draft.contact.age}
            onChange={(event) => onContactChange("age", event.target.value)}
            placeholder="20"
            className={inputClassName}
            aria-invalid={Boolean(errors.age)}
          />
        </Field>
        <Field id="city" label="Город поиска" error={errors.city}>
          <input
            id="field-city"
            name="city"
            autoComplete="address-level2"
            value={draft.contact.city}
            onChange={(event) => onContactChange("city", event.target.value)}
            placeholder="Санкт-Петербург"
            className={inputClassName}
            aria-invalid={Boolean(errors.city)}
          />
        </Field>
        <div className="sm:col-span-2 rounded-[18px] bg-[#F1F3ED] p-4 text-xs leading-5 text-[#62655D]">
          <ShieldCheck
            className="mr-2 inline size-4 text-[#5E7600]"
            aria-hidden="true"
          />
          Мы не показываем телефон в открытом профиле. Контакт станет доступен
          только после взаимного согласия.
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-7">
        <fieldset id="field-hobbies" tabIndex={-1} className="outline-none">
          <legend className="text-[13px] font-bold text-[#20201E]">
            Что вам нравится
          </legend>
          <p className="mt-1 text-xs text-[#73766E]">
            Выберите минимум два интереса.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {HOBBIES.map((hobby) => {
              const selected = draft.hobbies.includes(hobby);
              return (
                <button
                  key={hobby}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggleHobby(hobby)}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-[13px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#95B800] focus-visible:ring-offset-2",
                    selected
                      ? "border-[#95B800] bg-[#B3DB00] text-[#111111]"
                      : "border-[#DDDED7] bg-[#FFFFFC] text-[#565950] hover:border-[#B3DB00]",
                  )}
                >
                  {selected ? (
                    <Check
                      className="mr-1.5 inline size-3.5"
                      aria-hidden="true"
                    />
                  ) : null}
                  {hobby}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex max-w-sm gap-2">
            <input
              aria-label="Свой интерес"
              value={customHobby}
              onChange={(event) => onCustomHobbyChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddCustomHobby();
                }
              }}
              placeholder="Добавить своё"
              className="h-10 min-w-0 flex-1 rounded-full border border-[#DDDED7] bg-[#FFFFFC] px-4 text-sm outline-none focus:border-[#95B800] focus:ring-4 focus:ring-[#B3DB00]/15"
            />
            <button
              type="button"
              onClick={onAddCustomHobby}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[#DDDED7] bg-[#FFFFFC] transition hover:border-[#B3DB00] hover:bg-[#F8FBEA]"
              aria-label="Добавить интерес"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          {errors.hobbies ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A53A35]">
              <CircleAlert className="size-3.5" aria-hidden="true" />
              {errors.hobbies}
            </p>
          ) : null}
        </fieldset>

        <div className="h-px bg-[#E5E5E0]" />

        <div className="grid gap-6">
          <ChoiceGroup
            fieldId="smoking"
            legend="Курите?"
            value={draft.habits.smoking}
            choices={[
              { value: "no", label: "Нет" },
              { value: "yes", label: "Да" },
            ]}
            onChange={(value) => onHabitChange("smoking", value)}
            error={errors.smoking}
            compact
          />
          <ChoiceGroup
            fieldId="alcohol"
            legend="Как часто употребляете алкоголь?"
            value={draft.habits.alcohol}
            choices={[
              { value: "never", label: "Не употребляю" },
              { value: "sometimes", label: "Иногда" },
              { value: "often", label: "Часто" },
            ]}
            onChange={(value) => onHabitChange("alcohol", value)}
            error={errors.alcohol}
          />
          <ChoiceGroup
            fieldId="pets"
            legend="Есть домашние животные?"
            value={draft.habits.pets}
            choices={[
              { value: "no", label: "Нет" },
              { value: "yes", label: "Да" },
            ]}
            onChange={(value) => onHabitChange("pets", value)}
            error={errors.pets}
            compact
          />
          <ChoiceGroup
            fieldId="guests"
            legend="Как часто остаются гости?"
            value={draft.habits.guests}
            choices={[
              { value: "never", label: "Никогда" },
              { value: "rarely", label: "Редко" },
              { value: "often", label: "Часто" },
            ]}
            onChange={(value) => onHabitChange("guests", value)}
            error={errors.guests}
          />
          <ChoiceGroup
            fieldId="schedule"
            legend="Ваш обычный режим дня"
            value={draft.habits.schedule}
            choices={[
              {
                value: "early",
                label: "Ранний",
                description: "Рано встаю и ложусь",
              },
              {
                value: "flexible",
                label: "Гибкий",
                description: "Зависит от дня",
              },
              {
                value: "late",
                label: "Поздний",
                description: "Чаще активен вечером",
              },
            ]}
            onChange={(value) => onHabitChange("schedule", value)}
            error={errors.schedule}
          />
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#777A72]"
            aria-hidden="true"
          />
          <input
            id="field-districts"
            value={districtQuery}
            onChange={(event) => onDistrictQueryChange(event.target.value)}
            placeholder="Поиск района"
            aria-label="Поиск района"
            className="h-12 w-full rounded-[16px] border border-[#DDDED7] bg-[#FFFFFC] pl-11 pr-4 text-sm outline-none transition focus:border-[#95B800] focus:ring-4 focus:ring-[#B3DB00]/15"
          />
        </div>

        <div className="relative min-h-[190px] overflow-hidden rounded-[22px] border border-[#DCE3BB] bg-[#F2F7DB] p-5">
          <div className="absolute inset-0 opacity-45" aria-hidden="true">
            <div className="absolute left-[15%] top-[-30%] h-[160%] w-px rotate-[26deg] bg-[#B9C19A]" />
            <div className="absolute left-[53%] top-[-30%] h-[160%] w-px -rotate-[18deg] bg-[#B9C19A]" />
            <div className="absolute left-[-10%] top-[35%] h-px w-[130%] -rotate-[8deg] bg-[#B9C19A]" />
            <div className="absolute left-[-10%] top-[70%] h-px w-[130%] rotate-[12deg] bg-[#B9C19A]" />
          </div>
          <div className="relative flex h-full min-h-[148px] items-center justify-center">
            <div className="absolute size-36 rounded-full border border-[#95B800]/30 bg-[#B3DB00]/20" />
            <div className="absolute size-20 rounded-full border border-[#95B800]/50 bg-[#B3DB00]/25" />
            <span className="relative grid size-12 place-items-center rounded-full bg-[#111111] text-[#B3DB00] shadow-[0_10px_30px_rgba(17,17,17,0.18)]">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <span className="absolute bottom-1 rounded-full bg-[#FFFFFC]/90 px-3 py-1.5 text-[11px] font-extrabold text-[#111111] shadow-sm">
              {draft.districts.length > 0
                ? `Выбрано: ${draft.districts.length}`
                : "Выберите районы ниже"}
            </span>
          </div>
        </div>

        {draft.districts.length > 0 ? (
          <div>
            <p className="text-[12px] font-extrabold text-[#20201E]">Выбрано</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {draft.districts.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => onToggleDistrict(district)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#95B800] bg-[#EBF7B6] px-3.5 py-2 text-xs font-bold"
                  aria-label={`Убрать район ${district}`}
                >
                  {district}
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-[12px] font-extrabold text-[#20201E]">
            Популярные районы
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {filteredDistricts.map((district) => {
              const selected = draft.districts.includes(district);
              return (
                <button
                  key={district}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggleDistrict(district)}
                  className={cn(
                    "flex min-h-12 items-center justify-between rounded-[15px] border px-4 text-left text-[13px] font-bold transition",
                    selected
                      ? "border-[#95B800] bg-[#EBF7B6]"
                      : "border-[#DDDED7] bg-[#FFFFFC] hover:border-[#B3DB00]",
                  )}
                >
                  {district}
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border",
                      selected
                        ? "border-[#95B800] bg-[#B3DB00]"
                        : "border-[#D3D5CD] bg-[#F4F4F0]",
                    )}
                  >
                    {selected ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Plus className="size-3.5" aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {filteredDistricts.length === 0 ? (
            <p className="rounded-[16px] bg-[#F1F3ED] p-4 text-sm text-[#62655D]">
              Такого района пока нет в списке. Попробуйте другое название.
            </p>
          ) : null}
          {errors.districts ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A53A35]">
              <CircleAlert className="size-3.5" aria-hidden="true" />
              {errors.districts}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const minBudget = Math.min(
    Math.max(parseNumber(draft.budget.min) || 5_000, 5_000),
    200_000,
  );
  const maxBudget = Math.min(
    Math.max(parseNumber(draft.budget.max) || 6_000, 6_000),
    250_000,
  );
  const midpoint = Math.round((minBudget + maxBudget) / 2);

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-[#DDE4BF] bg-[#F3F8DE] p-5 text-center sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#627500]">
          Ваш диапазон
        </p>
        <p className="mt-2 text-[clamp(24px,5vw,38px)] font-black tracking-[-0.04em] text-[#111111]">
          {formatRubles(minBudget)} — {formatRubles(maxBudget)}
        </p>
        <p className="mt-2 text-xs text-[#666A61]">
          за вашу часть аренды в месяц
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="budgetMin" label="Минимум, ₽" error={errors.budgetMin}>
          <input
            id="field-budgetMin"
            type="number"
            inputMode="numeric"
            min="5000"
            max="200000"
            step="1000"
            value={draft.budget.min}
            onChange={(event) => onBudgetChange("min", event.target.value)}
            className={inputClassName}
            aria-invalid={Boolean(errors.budgetMin)}
          />
        </Field>
        <Field id="budgetMax" label="Максимум, ₽" error={errors.budgetMax}>
          <input
            id="field-budgetMax"
            type="number"
            inputMode="numeric"
            min="6000"
            max="250000"
            step="1000"
            value={draft.budget.max}
            onChange={(event) => onBudgetChange("max", event.target.value)}
            className={inputClassName}
            aria-invalid={Boolean(errors.budgetMax)}
          />
        </Field>
      </div>

      <div className="rounded-[22px] border border-[#DDDED7] bg-[#FFFFFC] p-5">
        <div
          aria-hidden="true"
          className="mb-5 flex h-20 items-end justify-between gap-1.5"
        >
          {[28, 42, 55, 74, 92, 78, 63, 46, 31, 20].map((height, index) => (
            <span
              key={height}
              className={cn(
                "w-full rounded-t-full",
                index >= 2 && index <= 7 ? "bg-[#B3DB00]" : "bg-[#E5E5E0]",
              )}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <label
          htmlFor="field-budget-range-min"
          className="text-xs font-bold text-[#62655D]"
        >
          Нижняя граница
        </label>
        <input
          id="field-budget-range-min"
          type="range"
          min="5000"
          max="200000"
          step="1000"
          value={minBudget}
          onChange={(event) => {
            const value = Math.min(
              Number(event.target.value),
              maxBudget - 1_000,
            );
            onBudgetChange("min", String(value));
          }}
          className="mt-2 w-full cursor-pointer accent-[#B3DB00]"
        />
        <label
          htmlFor="field-budget-range-max"
          className="mt-4 block text-xs font-bold text-[#62655D]"
        >
          Верхняя граница
        </label>
        <input
          id="field-budget-range-max"
          type="range"
          min="6000"
          max="250000"
          step="1000"
          value={maxBudget}
          onChange={(event) => {
            const value = Math.max(
              Number(event.target.value),
              minBudget + 1_000,
            );
            onBudgetChange("max", String(value));
          }}
          className="mt-2 w-full cursor-pointer accent-[#B3DB00]"
        />
      </div>

      <div className="flex items-start gap-3 rounded-[18px] bg-[#F1F3ED] p-4">
        <Sparkles
          className="mt-0.5 size-4 shrink-0 text-[#6B8300]"
          aria-hidden="true"
        />
        <p className="text-xs leading-5 text-[#62655D]">
          Центр диапазона —{" "}
          <strong className="text-[#111111]">{formatRubles(midpoint)}</strong>.
          Мы покажем варианты рядом с этой суммой и не выйдем за ваш максимум.
        </p>
      </div>
    </div>
  );
}

function LandlordStep({
  step,
  draft,
  errors,
  photos,
  onPropertyChange,
  onTermChange,
  onToggleAmenity,
  onDetailsChange,
  onPhotosChange,
  onRemovePhoto,
}: LandlordStepProps) {
  if (step === 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            id="address"
            label="Адрес"
            error={errors.address}
            hint="Номер квартиры не будет виден в открытом объявлении."
          >
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#777A72]"
                aria-hidden="true"
              />
              <input
                id="field-address"
                name="address"
                autoComplete="street-address"
                value={draft.property.address}
                onChange={(event) =>
                  onPropertyChange("address", event.target.value)
                }
                placeholder="ул. Ленина, 15, кв. 45"
                className={cn(inputClassName, "pl-11")}
                aria-invalid={Boolean(errors.address)}
              />
            </div>
          </Field>
        </div>
        <Field id="propertyType" label="Тип жилья" error={errors.propertyType}>
          <div className="relative">
            <select
              id="field-propertyType"
              value={draft.property.type}
              onChange={(event) => onPropertyChange("type", event.target.value)}
              className={selectClassName}
              aria-invalid={Boolean(errors.propertyType)}
            >
              <option value="Квартира">Квартира</option>
              <option value="Комната">Комната</option>
              <option value="Апартаменты">Апартаменты</option>
              <option value="Дом">Дом</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute bottom-4 right-4 size-4 text-[#777A72]"
              aria-hidden="true"
            />
          </div>
        </Field>
        <Field id="rooms" label="Количество комнат" error={errors.rooms}>
          <input
            id="field-rooms"
            type="number"
            inputMode="numeric"
            min="1"
            max="20"
            value={draft.property.rooms}
            onChange={(event) => onPropertyChange("rooms", event.target.value)}
            placeholder="2"
            className={inputClassName}
            aria-invalid={Boolean(errors.rooms)}
          />
        </Field>
        <Field id="area" label="Площадь, м²" error={errors.area}>
          <div className="relative">
            <Ruler
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#777A72]"
              aria-hidden="true"
            />
            <input
              id="field-area"
              type="number"
              inputMode="decimal"
              min="8"
              max="1000"
              step="0.1"
              value={draft.property.area}
              onChange={(event) => onPropertyChange("area", event.target.value)}
              placeholder="45"
              className={cn(inputClassName, "pl-11")}
              aria-invalid={Boolean(errors.area)}
            />
          </div>
        </Field>
        <Field id="floor" label="Этаж" error={errors.floor}>
          <div className="relative">
            <Layers
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#777A72]"
              aria-hidden="true"
            />
            <input
              id="field-floor"
              value={draft.property.floor}
              onChange={(event) =>
                onPropertyChange("floor", event.target.value)
              }
              placeholder="5 из 9"
              className={cn(inputClassName, "pl-11")}
              aria-invalid={Boolean(errors.floor)}
            />
          </div>
        </Field>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div id="field-photos" tabIndex={-1} className="outline-none">
        <label
          htmlFor="property-photos"
          className="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#AFCD29] bg-[#F3F8DE] px-5 text-center outline-none transition hover:border-[#7F9D00] hover:bg-[#EEF7C6] focus-within:ring-2 focus-within:ring-[#95B800] focus-within:ring-offset-2"
        >
          <span className="grid size-12 place-items-center rounded-full bg-[#B3DB00] text-[#111111] transition group-hover:scale-105">
            <Upload className="size-5" aria-hidden="true" />
          </span>
          <span className="mt-3 text-sm font-extrabold">
            Добавить фотографии
          </span>
          <span className="mt-1 text-xs leading-5 text-[#686C62]">
            JPG, PNG или WebP · до 10 МБ · максимум {MAX_PHOTOS}
          </span>
          <input
            id="property-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onPhotosChange}
            className="sr-only"
          />
        </label>

        {errors.photos ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A53A35]">
            <CircleAlert className="size-3.5" aria-hidden="true" />
            {errors.photos}
          </p>
        ) : null}

        {photos.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <figure
                key={photo.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#E9EAE5]"
              >
                <Image
                  src={photo.url}
                  alt={`Фотография квартиры ${index + 1}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 220px"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                {index === 0 ? (
                  <figcaption className="absolute bottom-2 left-2 rounded-full bg-[#B3DB00] px-2.5 py-1 text-[10px] font-black text-[#111111]">
                    Обложка
                  </figcaption>
                ) : null}
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-[#111111]/90 text-white outline-none transition hover:bg-[#111111] focus-visible:ring-2 focus-visible:ring-[#B3DB00] focus-visible:ring-offset-2"
                  aria-label={`Удалить фотографию ${index + 1}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-[18px] bg-[#F1F3ED] p-4">
            <ImageIcon
              className="mt-0.5 size-4 shrink-0 text-[#6A6E65]"
              aria-hidden="true"
            />
            <p className="text-xs leading-5 text-[#62655D]">
              Начните с общего вида комнаты, затем добавьте кухню, санузел и вид
              из окна.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="rent" label="Аренда в месяц, ₽" error={errors.rent}>
            <input
              id="field-rent"
              type="number"
              inputMode="numeric"
              min="1000"
              step="1000"
              value={draft.terms.rent}
              onChange={(event) => onTermChange("rent", event.target.value)}
              placeholder="45 000"
              className={inputClassName}
              aria-invalid={Boolean(errors.rent)}
            />
          </Field>
          <Field
            id="deposit"
            label="Залог, ₽"
            error={errors.deposit}
            hint="Если залога нет, укажите 0."
          >
            <input
              id="field-deposit"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={draft.terms.deposit}
              onChange={(event) => onTermChange("deposit", event.target.value)}
              placeholder="45 000"
              className={inputClassName}
              aria-invalid={Boolean(errors.deposit)}
            />
          </Field>
        </div>
        <ChoiceGroup
          fieldId="utilities"
          legend="Коммунальные платежи"
          value={draft.terms.utilities}
          choices={[
            {
              value: "included",
              label: "Включены",
              description: "Уже входят в аренду",
            },
            {
              value: "separate",
              label: "Отдельно",
              description: "Оплачивает жилец",
            },
          ]}
          onChange={(value) => onTermChange("utilities", value)}
          error={errors.utilities}
        />
        <ChoiceGroup
          fieldId="lease"
          legend="Минимальный срок аренды"
          value={draft.terms.lease}
          choices={[
            { value: "6", label: "6 месяцев" },
            { value: "11", label: "11 месяцев" },
            { value: "12_plus", label: "От года" },
            { value: "flexible", label: "Гибко" },
          ]}
          onChange={(value) => onTermChange("lease", value)}
          error={errors.lease}
          compact
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={draft.terms.petsAllowed}
            onClick={() =>
              onTermChange("petsAllowed", !draft.terms.petsAllowed)
            }
            className={cn(
              "flex min-h-16 items-center justify-between rounded-[17px] border px-4 text-left transition",
              draft.terms.petsAllowed
                ? "border-[#95B800] bg-[#EBF7B6]"
                : "border-[#DDDED7] bg-[#FFFFFC] hover:border-[#B3DB00]",
            )}
          >
            <span>
              <span className="block text-[13px] font-extrabold">
                Можно с животными
              </span>
              <span className="mt-1 block text-[11px] text-[#73766E]">
                Питомцы обсуждаются
              </span>
            </span>
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border",
                draft.terms.petsAllowed
                  ? "border-[#95B800] bg-[#B3DB00]"
                  : "border-[#D3D5CD]",
              )}
            >
              {draft.terms.petsAllowed ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : null}
            </span>
          </button>
          <button
            type="button"
            role="checkbox"
            aria-checked={draft.terms.smokingAllowed}
            onClick={() =>
              onTermChange("smokingAllowed", !draft.terms.smokingAllowed)
            }
            className={cn(
              "flex min-h-16 items-center justify-between rounded-[17px] border px-4 text-left transition",
              draft.terms.smokingAllowed
                ? "border-[#95B800] bg-[#EBF7B6]"
                : "border-[#DDDED7] bg-[#FFFFFC] hover:border-[#B3DB00]",
            )}
          >
            <span>
              <span className="block text-[13px] font-extrabold">
                Можно курить
              </span>
              <span className="mt-1 block text-[11px] text-[#73766E]">
                В квартире или на балконе
              </span>
            </span>
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border",
                draft.terms.smokingAllowed
                  ? "border-[#95B800] bg-[#B3DB00]"
                  : "border-[#D3D5CD]",
              )}
            >
              {draft.terms.smokingAllowed ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : null}
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <fieldset id="field-amenities" tabIndex={-1} className="outline-none">
        <legend className="sr-only">Оснащение квартиры</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {AMENITIES.map((amenity) => {
            const Icon = amenity.icon;
            const selected = draft.amenities.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => onToggleAmenity(amenity.id)}
                className={cn(
                  "flex min-h-[62px] items-center gap-3 rounded-[17px] border px-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#95B800] focus-visible:ring-offset-2",
                  selected
                    ? "border-[#95B800] bg-[#EBF7B6]"
                    : "border-[#DDDED7] bg-[#FFFFFC] hover:border-[#B3DB00] hover:bg-[#F8FBEA]",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    selected ? "bg-[#B3DB00]" : "bg-[#F1F3ED]",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-[13px] font-bold">
                  {amenity.label}
                </span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border",
                    selected
                      ? "border-[#95B800] bg-[#B3DB00]"
                      : "border-[#D3D5CD]",
                  )}
                >
                  {selected ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        {errors.amenities ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#A53A35]">
            <CircleAlert className="size-3.5" aria-hidden="true" />
            {errors.amenities}
          </p>
        ) : null}
      </fieldset>
    );
  }

  const descriptionLength = draft.details.description.trim().length;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field
          id="description"
          label="Описание"
          error={errors.description}
          hint={`${descriptionLength}/1 200 символов`}
        >
          <textarea
            id="field-description"
            rows={6}
            maxLength={1200}
            value={draft.details.description}
            onChange={(event) =>
              onDetailsChange("description", event.target.value)
            }
            placeholder="Светлая квартира рядом с метро. Тихий двор, отдельные комнаты и удобные рабочие места…"
            className={cn(inputClassName, "min-h-36 resize-y py-3.5 leading-6")}
            aria-invalid={Boolean(errors.description)}
          />
        </Field>
      </div>
      <Field id="buildingType" label="Тип дома" error={errors.buildingType}>
        <div className="relative">
          <select
            id="field-buildingType"
            value={draft.details.buildingType}
            onChange={(event) =>
              onDetailsChange("buildingType", event.target.value)
            }
            className={selectClassName}
            aria-invalid={Boolean(errors.buildingType)}
          >
            <option value="">Выберите</option>
            <option value="Кирпичный">Кирпичный</option>
            <option value="Монолитный">Монолитный</option>
            <option value="Панельный">Панельный</option>
            <option value="Блочный">Блочный</option>
            <option value="Деревянный">Деревянный</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute bottom-4 right-4 size-4 text-[#777A72]"
            aria-hidden="true"
          />
        </div>
      </Field>
      <Field id="year" label="Год постройки" error={errors.year}>
        <input
          id="field-year"
          type="number"
          inputMode="numeric"
          min="1700"
          max={new Date().getFullYear() + 1}
          value={draft.details.year}
          onChange={(event) => onDetailsChange("year", event.target.value)}
          placeholder="2010"
          className={inputClassName}
          aria-invalid={Boolean(errors.year)}
        />
      </Field>
      <div className="sm:col-span-2 flex items-start gap-3 rounded-[18px] bg-[#F1F3ED] p-4">
        <FileText
          className="mt-0.5 size-4 shrink-0 text-[#6A6E65]"
          aria-hidden="true"
        />
        <p className="text-xs leading-5 text-[#62655D]">
          Перед публикацией вы сможете проверить объявление и изменить любые
          данные.
        </p>
      </div>
    </div>
  );
}

function TenantSummary({ draft }: { draft: TenantDraft }) {
  const budgetReady =
    parseNumber(draft.budget.min) > 0 && parseNumber(draft.budget.max) > 0;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#B3DB00] text-[#111111]">
          <UserRound className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-black">
            {draft.contact.name || "Ваш профиль"}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#74776F]">
            {[
              draft.contact.age ? `${draft.contact.age} лет` : "",
              draft.contact.city,
            ]
              .filter(Boolean)
              .join(" · ") || "Заполните контакты"}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <div className="rounded-[15px] bg-[#F1F3ED] p-3">
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A72]">
            Бюджет
          </dt>
          <dd className="mt-1 text-xs font-extrabold">
            {budgetReady
              ? `${formatRubles(draft.budget.min)}–${formatRubles(draft.budget.max)}`
              : "Не указан"}
          </dd>
        </div>
        <div className="rounded-[15px] bg-[#F1F3ED] p-3">
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#777A72]">
            Районы
          </dt>
          <dd className="mt-1 text-xs font-extrabold">
            {draft.districts.length || "—"}
          </dd>
        </div>
      </dl>

      <div>
        <p className="text-[11px] font-extrabold text-[#55584F]">Интересы</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {draft.hobbies.length > 0 ? (
            draft.hobbies.slice(0, 5).map((hobby) => (
              <span
                key={hobby}
                className="rounded-full bg-[#EBF7B6] px-2.5 py-1.5 text-[10px] font-bold text-[#394700]"
              >
                {hobby}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#777A72]">Пока не выбраны</span>
          )}
        </div>
      </div>

      <div className="rounded-[18px] bg-[#111111] p-4 text-[#F4F4F0]">
        <div className="flex items-center gap-2 text-xs font-extrabold">
          <Sparkles className="size-4 text-[#B3DB00]" aria-hidden="true" />
          Умный подбор
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[#C9CAC4]">
          После анкеты мы соберём рекомендации по привычкам, бюджету и районам.
        </p>
      </div>
    </div>
  );
}

function LandlordSummary({
  draft,
  photos,
}: {
  draft: LandlordDraft;
  photos: PhotoItem[];
}) {
  const amenityNames = draft.amenities
    .map((id) => AMENITIES.find((item) => item.id === id)?.label)
    .filter((item): item is string => Boolean(item));

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-[#EEF0E9]">
        {photos[0] ? (
          <Image
            src={photos[0].url}
            alt="Обложка объявления"
            fill
            unoptimized
            sizes="320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-[#777A72]">
            <ImageIcon className="size-7" aria-hidden="true" />
            <span className="mt-2 text-[11px] font-bold">
              Здесь будет обложка
            </span>
          </div>
        )}
        {photos.length > 0 ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-[#111111]/85 px-2.5 py-1 text-[10px] font-bold text-white">
            {photos.length} фото
          </span>
        ) : null}
      </div>

      <div>
        <p className="truncate text-base font-black">
          {draft.property.address || "Новое объявление"}
        </p>
        <p className="mt-1 text-xs text-[#74776F]">
          {[
            draft.property.type,
            draft.property.rooms ? `${draft.property.rooms} комн.` : "",
            draft.property.area ? `${draft.property.area} м²` : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="rounded-[17px] bg-[#EBF7B6] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#617400]">
          Аренда в месяц
        </p>
        <p className="mt-1 text-xl font-black text-[#111111]">
          {formatRubles(draft.terms.rent)}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-extrabold text-[#55584F]">Оснащение</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {amenityNames.length > 0 ? (
            amenityNames.slice(0, 5).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-[#F1F3ED] px-2.5 py-1.5 text-[10px] font-bold"
              >
                {amenity}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#777A72]">Пока не указано</span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-[16px] border border-[#E1E2DC] p-3">
        <BadgeCheck
          className="mt-0.5 size-4 shrink-0 text-[#6D8600]"
          aria-hidden="true"
        />
        <p className="text-[11px] leading-4 text-[#666A61]">
          После проверки объявление появится в поиске жильцов.
        </p>
      </div>
    </div>
  );
}

function Summary({
  role,
  tenant,
  landlord,
  photos,
  compact = false,
}: SummaryProps) {
  const content =
    role === "tenant" ? (
      <TenantSummary draft={tenant} />
    ) : (
      <LandlordSummary draft={landlord} photos={photos} />
    );

  if (compact) {
    return (
      <details className="group rounded-[20px] border border-[#DFE0DA] bg-[#FFFFFC] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-xs font-extrabold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#718900]" aria-hidden="true" />
            Предпросмотр профиля
          </span>
          <ChevronDown
            className="size-4 transition group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-[#E5E5E0] p-4">{content}</div>
      </details>
    );
  }

  return (
    <aside
      className="sticky top-24 hidden self-start lg:block"
      aria-label="Предпросмотр"
    >
      <div className="rounded-[24px] border border-[#DFE0DA] bg-[#FFFFFC] p-5 shadow-[0_16px_40px_rgba(17,17,17,0.05)]">
        <div className="mb-5 flex items-center justify-between border-b border-[#E5E5E0] pb-4">
          <p className="text-xs font-black">Предпросмотр</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F3ED] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#65685F]">
            <span className="size-1.5 rounded-full bg-[#B3DB00]" />В реальном
            времени
          </span>
        </div>
        {content}
      </div>
    </aside>
  );
}

export function OnboardingFlow({
  role: initialRole = "tenant",
}: OnboardingFlowProps) {
  const router = useRouter();
  const [role, setRole] = useState<OnboardingRole>(initialRole);
  const [tenant, setTenant] = useState<TenantDraft>(DEFAULT_TENANT);
  const [landlord, setLandlord] = useState<LandlordDraft>(DEFAULT_LANDLORD);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [step, setStep] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [districtQuery, setDistrictQuery] = useState("");
  const [customHobby, setCustomHobby] = useState("");
  const photoUrls = useRef(new Set<string>());

  const steps = role === "tenant" ? TENANT_STEPS : LANDLORD_STEPS;
  const currentStep = steps[step] ?? steps[0];
  const isLastStep = step === steps.length - 1;
  const progress = Math.round(((step + 1) / steps.length) * 100);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    setHydrated(false);
    setStep(0);
    setHighestStep(0);
    setErrors({});
    setSubmitError(null);

    try {
      const raw = window.localStorage.getItem(draftStorageKey(role));
      if (!raw) {
        setHydrated(true);
        return;
      }

      const stored = JSON.parse(raw) as {
        version?: number;
        step?: number;
        highestStep?: number;
        data?: unknown;
      };
      if (stored.version !== DRAFT_VERSION) {
        setHydrated(true);
        return;
      }

      const restoredStep = clampStep(stored.step, steps.length);
      const restoredHighest = Math.max(
        restoredStep,
        clampStep(stored.highestStep, steps.length),
      );
      if (role === "tenant") setTenant(normalizeTenantDraft(stored.data));
      else setLandlord(normalizeLandlordDraft(stored.data));
      setStep(restoredStep);
      setHighestStep(restoredHighest);
    } catch {
      window.localStorage.removeItem(draftStorageKey(role));
    } finally {
      setHydrated(true);
    }
  }, [role, steps.length]);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      const data = role === "tenant" ? tenant : landlord;
      window.localStorage.setItem(
        draftStorageKey(role),
        JSON.stringify({ version: DRAFT_VERSION, step, highestStep, data }),
      );
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [hydrated, highestStep, landlord, role, step, tenant]);

  useEffect(() => {
    const urls = photoUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const roleLabel = role === "tenant" ? "Ищу жильё" : "Сдаю жильё";
  const roleDescription =
    role === "tenant" ? "Профиль арендатора" : "Карточка объекта";

  const filledSummary = useMemo(() => {
    if (role === "tenant") {
      return [
        tenant.contact.name,
        tenant.contact.phone,
        tenant.contact.age,
        tenant.contact.city,
        tenant.hobbies.length,
        tenant.habits.smoking,
        tenant.habits.alcohol,
        tenant.habits.pets,
        tenant.habits.guests,
        tenant.habits.schedule,
        tenant.districts.length,
        tenant.budget.min && tenant.budget.max,
      ].filter(Boolean).length;
    }
    return [
      landlord.property.address,
      landlord.property.rooms,
      landlord.property.area,
      landlord.property.floor,
      photos.length,
      landlord.terms.rent,
      landlord.terms.deposit,
      landlord.terms.utilities,
      landlord.terms.lease,
      landlord.amenities.length,
      landlord.details.description,
      landlord.details.buildingType,
      landlord.details.year,
    ].filter(Boolean).length;
  }, [landlord, photos.length, role, tenant]);

  const summaryTotal = role === "tenant" ? 12 : 13;

  const changeRole = (nextRole: OnboardingRole) => {
    if (nextRole === role || submitting) return;
    setRole(nextRole);
    window.localStorage.setItem("sosedi-role", nextRole);
    router.replace(`/onboarding?role=${nextRole}`, { scroll: false });
  };

  const updateContact = (
    field: keyof TenantDraft["contact"],
    value: string,
  ) => {
    setTenant((current) => ({
      ...current,
      contact: { ...current.contact, [field]: value },
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const updateHabit = (field: keyof TenantDraft["habits"], value: string) => {
    setTenant((current) => ({
      ...current,
      habits: { ...current.habits, [field]: value } as TenantDraft["habits"],
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const toggleHobby = (hobby: string) => {
    setTenant((current) => ({
      ...current,
      hobbies: current.hobbies.includes(hobby)
        ? current.hobbies.filter((item) => item !== hobby)
        : [...current.hobbies, hobby].slice(0, 12),
    }));
    setErrors((current) => ({ ...current, hobbies: "" }));
  };

  const addCustomHobby = () => {
    const hobby = customHobby.trim();
    if (
      hobby.length < 2 ||
      tenant.hobbies.some((item) => item.toLowerCase() === hobby.toLowerCase())
    )
      return;
    toggleHobby(hobby);
    setCustomHobby("");
  };

  const toggleDistrict = (district: string) => {
    setTenant((current) => ({
      ...current,
      districts: current.districts.includes(district)
        ? current.districts.filter((item) => item !== district)
        : [...current.districts, district],
    }));
    setErrors((current) => ({ ...current, districts: "" }));
  };

  const updateBudget = (field: keyof TenantDraft["budget"], value: string) => {
    setTenant((current) => ({
      ...current,
      budget: { ...current.budget, [field]: value },
    }));
    setErrors((current) => ({ ...current, budgetMin: "", budgetMax: "" }));
  };

  const updateProperty = (
    field: keyof LandlordDraft["property"],
    value: string,
  ) => {
    setLandlord((current) => ({
      ...current,
      property: { ...current.property, [field]: value },
    }));
    const errorKey = field === "type" ? "propertyType" : field;
    setErrors((current) => ({ ...current, [errorKey]: "" }));
  };

  const updateTerm = (
    field: keyof LandlordDraft["terms"],
    value: string | boolean,
  ) => {
    setLandlord((current) => ({
      ...current,
      terms: { ...current.terms, [field]: value } as LandlordDraft["terms"],
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const toggleAmenity = (amenity: string) => {
    setLandlord((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
    setErrors((current) => ({ ...current, amenities: "" }));
  };

  const updateDetails = (
    field: keyof LandlordDraft["details"],
    value: string,
  ) => {
    setLandlord((current) => ({
      ...current,
      details: { ...current.details, [field]: value },
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handlePhotosChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const slots = Math.max(MAX_PHOTOS - photos.length, 0);
    const accepted = selectedFiles
      .filter(
        (file) =>
          file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES,
      )
      .slice(0, slots);

    if (accepted.length === 0) {
      setErrors((current) => ({
        ...current,
        photos:
          slots === 0
            ? `Можно добавить не больше ${MAX_PHOTOS} фото.`
            : "Выберите JPG, PNG или WebP до 10 МБ.",
      }));
      event.target.value = "";
      return;
    }

    const nextPhotos = accepted.map((file, index) => {
      const url = URL.createObjectURL(file);
      photoUrls.current.add(url);
      return {
        id: `${file.name}-${file.lastModified}-${index}-${Date.now()}`,
        file,
        url,
      };
    });
    setPhotos((current) => [...current, ...nextPhotos]);
    setErrors((current) => ({ ...current, photos: "" }));
    event.target.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const removed = current.find((photo) => photo.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
        photoUrls.current.delete(removed.url);
      }
      return current.filter((photo) => photo.id !== id);
    });
  };

  const goToStep = (nextStep: number) => {
    if (nextStep > highestStep || submitting) return;
    setStep(nextStep);
    setErrors({});
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateCurrentStep = () =>
    role === "tenant"
      ? validateTenantStep(step, tenant)
      : validateLandlordStep(step, landlord, photos.length);

  const findFirstInvalidStep = () => {
    for (let index = 0; index < steps.length; index += 1) {
      const stepErrors =
        role === "tenant"
          ? validateTenantStep(index, tenant)
          : validateLandlordStep(index, landlord, photos.length);
      if (hasErrors(stepErrors)) return { index, errors: stepErrors };
    }
    return null;
  };

  const buildPayload = () => {
    if (role === "tenant") {
      return {
        role,
        profile: {
          name: tenant.contact.name.trim(),
          phone: tenant.contact.phone.trim(),
          age: Number(tenant.contact.age),
          city: tenant.contact.city.trim(),
        },
        preferences: { hobbies: tenant.hobbies, habits: tenant.habits },
        search: {
          districts: tenant.districts,
          budgetMin: parseNumber(tenant.budget.min),
          budgetMax: parseNumber(tenant.budget.max),
        },
      };
    }

    return {
      role,
      property: {
        address: landlord.property.address.trim(),
        type: landlord.property.type,
        rooms: Number(landlord.property.rooms),
        area: Number(landlord.property.area),
        floor: landlord.property.floor.trim(),
      },
      terms: {
        rent: parseNumber(landlord.terms.rent),
        deposit: parseNumber(landlord.terms.deposit),
        utilities: landlord.terms.utilities,
        petsAllowed: landlord.terms.petsAllowed,
        smokingAllowed: landlord.terms.smokingAllowed,
        lease: landlord.terms.lease,
      },
      amenities: landlord.amenities,
      details: {
        description: landlord.details.description.trim(),
        buildingType: landlord.details.buildingType,
        year: Number(landlord.details.year),
      },
      photos: {
        count: photos.length,
        names: photos.map((photo) => photo.file.name),
      },
    };
  };

  const finishOnboarding = async () => {
    const invalid = findFirstInvalidStep();
    if (invalid) {
      setStep(invalid.index);
      setErrors(invalid.errors);
      setSubmitError("Проверьте отмеченные поля перед завершением.");
      focusError(getFirstError(invalid.errors));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
            result.message ||
            "Не удалось сохранить анкету.",
        );
      }

      if (role === "landlord" && photos.length > 0) {
        const propertyId =
          result.propertyId ||
          result.id ||
          result.data?.id ||
          `draft-${Date.now()}`;
        await uploadPropertyPhotos(photos, propertyId);
      }

      window.localStorage.removeItem(draftStorageKey(role));
      window.localStorage.setItem("sosedi-role", role);
      const expectedDestination = role === "tenant" ? "/app" : "/owner";
      const destination =
        result.destination === "/app" || result.destination === "/owner"
          ? result.destination
          : expectedDestination;
      router.replace(destination);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить анкету. Попробуйте ещё раз.",
      );
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors = validateCurrentStep();
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      focusError(getFirstError(nextErrors));
      return;
    }

    setErrors({});
    if (!isLastStep) {
      const nextStep = step + 1;
      setHighestStep((current) => Math.max(current, nextStep));
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    await finishOnboarding();
  };

  const goBack = () => {
    if (submitting) return;
    if (step > 0) {
      setStep((current) => current - 1);
      setErrors({});
      setSubmitError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.back();
  };

  const exitOnboarding = async () => {
    if (submitting || exiting) return;
    setExiting(true);
    try {
      await createClient().auth.signOut();
    } finally {
      router.replace("/auth/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] font-somic text-[#111111] [color-scheme:light]">
      <header className="border-b border-[#E1E2DC] bg-[#F4F4F0]/95 px-4 py-4 backdrop-blur sm:px-6 lg:sticky lg:top-0 lg:z-30">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4">
          <BrandLogo className="shrink-0 [&_img]:h-7 [&_img]:w-auto sm:[&_img]:h-8" />
          <div className="hidden items-center gap-2 text-xs font-bold text-[#666A61] sm:flex">
            <Save className="size-4 text-[#718900]" aria-hidden="true" />
            Черновик сохраняется автоматически
          </div>
          <button
            type="button"
            onClick={exitOnboarding}
            disabled={submitting || exiting}
            className="rounded-full border border-[#D9DAD4] bg-[#FFFFFC] px-3.5 py-2 text-xs font-extrabold transition hover:border-[#B3DB00]"
          >
            {exiting ? "Выходим…" : "Выйти"}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1450px] px-4 pb-32 pt-5 sm:px-6 sm:pt-7 lg:pb-12 lg:pt-9">
        <section className="mb-5 flex flex-col gap-4 border-b border-[#E1E2DC] pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#718900]">
              Первый шаг к комфортной аренде
            </p>
            <h1 className="mt-2 text-[clamp(28px,4vw,46px)] font-black leading-[0.98] tracking-[-0.045em]">
              Настроим Соседей под вас
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#686C62]">
              Заполните короткую анкету — остальное можно изменить позже в
              профиле.
            </p>
          </div>

          <div
            className="inline-flex w-full rounded-full border border-[#D9DAD4] bg-[#FFFFFC] p-1 sm:w-auto"
            role="group"
            aria-label="Роль на платформе"
          >
            <button
              type="button"
              aria-pressed={role === "tenant"}
              onClick={() => changeRole("tenant")}
              className={cn(
                "min-h-10 flex-1 rounded-full px-4 text-xs font-extrabold transition sm:flex-none",
                role === "tenant"
                  ? "bg-[#B3DB00] text-[#111111]"
                  : "text-[#666A61] hover:bg-[#F1F3ED]",
              )}
            >
              Ищу жильё
            </button>
            <button
              type="button"
              aria-pressed={role === "landlord"}
              onClick={() => changeRole("landlord")}
              className={cn(
                "min-h-10 flex-1 rounded-full px-4 text-xs font-extrabold transition sm:flex-none",
                role === "landlord"
                  ? "bg-[#B3DB00] text-[#111111]"
                  : "text-[#666A61] hover:bg-[#F1F3ED]",
              )}
            >
              Сдаю жильё
            </button>
          </div>
        </section>

        <div className="mb-5 lg:hidden">
          <FlowProgress
            steps={steps}
            currentStep={step}
            highestStep={highestStep}
            onSelect={goToStep}
          />
        </div>

        <div className="grid gap-7 lg:grid-cols-[210px_minmax(0,1fr)_300px] xl:grid-cols-[230px_minmax(0,760px)_330px] xl:justify-between">
          <aside className="hidden lg:block">
            <div className="mb-5 rounded-[20px] bg-[#111111] p-4 text-[#F4F4F0]">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B3DB00]">
                {roleDescription}
              </p>
              <p className="mt-2 text-base font-black">{roleLabel}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#B3DB00] transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-[#C9CAC4]">
                Заполнено {filledSummary} из {summaryTotal} пунктов
              </p>
            </div>
            <FlowProgress
              steps={steps}
              currentStep={step}
              highestStep={highestStep}
              onSelect={goToStep}
            />
          </aside>

          <div className="min-w-0">
            <Summary
              role={role}
              tenant={tenant}
              landlord={landlord}
              photos={photos}
              compact
            />

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-4 rounded-[26px] border border-[#DFE0DA] bg-[#FFFFFC] p-5 shadow-[0_18px_48px_rgba(17,17,17,0.045)] sm:p-7 lg:mt-0 lg:p-8"
            >
              <div className="mb-7 flex items-start gap-4 border-b border-[#E5E5E0] pb-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#B3DB00] text-sm font-black">
                  {step + 1}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#73766E]">
                    Шаг {step + 1} из {steps.length} · {currentStep.label}
                  </p>
                  <h2 className="mt-1.5 text-[clamp(22px,4vw,32px)] font-black leading-tight tracking-[-0.035em]">
                    {currentStep.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#686C62]">
                    {currentStep.description}
                  </p>
                </div>
              </div>

              {role === "tenant" ? (
                <TenantStep
                  step={step}
                  draft={tenant}
                  errors={errors}
                  districtQuery={districtQuery}
                  customHobby={customHobby}
                  onDistrictQueryChange={setDistrictQuery}
                  onCustomHobbyChange={setCustomHobby}
                  onAddCustomHobby={addCustomHobby}
                  onContactChange={updateContact}
                  onHabitChange={updateHabit}
                  onToggleHobby={toggleHobby}
                  onToggleDistrict={toggleDistrict}
                  onBudgetChange={updateBudget}
                />
              ) : (
                <LandlordStep
                  step={step}
                  draft={landlord}
                  errors={errors}
                  photos={photos}
                  onPropertyChange={updateProperty}
                  onTermChange={updateTerm}
                  onToggleAmenity={toggleAmenity}
                  onDetailsChange={updateDetails}
                  onPhotosChange={handlePhotosChange}
                  onRemovePhoto={removePhoto}
                />
              )}

              {submitError ? (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-2 rounded-[16px] bg-[#FBECEA] p-4 text-xs font-semibold leading-5 text-[#8E312D]"
                >
                  <CircleAlert
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {submitError}
                </div>
              ) : null}

              <div className="mt-8 hidden items-center justify-between gap-3 border-t border-[#E5E5E0] pt-6 sm:flex">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={submitting}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#D9DAD4] bg-[#FFFFFC] px-5 text-sm font-extrabold transition hover:border-[#B3DB00] disabled:opacity-50"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={submitting || !hydrated}
                  className="lime-button inline-flex min-h-12 min-w-40 items-center justify-center gap-2 rounded-full px-6 text-sm disabled:cursor-wait disabled:opacity-65"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      Сохраняем…
                    </>
                  ) : isLastStep ? (
                    <>
                      Завершить
                      <PartyPopper className="size-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Далее
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <Summary
            role={role}
            tenant={tenant}
            landlord={landlord}
            photos={photos}
          />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DEDFD9] bg-[#FFFFFC]/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="grid size-12 shrink-0 place-items-center rounded-full border border-[#D9DAD4] bg-[#FFFFFC] disabled:opacity-50"
            aria-label="Назад"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() =>
              document.querySelector<HTMLFormElement>("form")?.requestSubmit()
            }
            disabled={submitting || !hydrated}
            className="lime-button inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm disabled:opacity-65"
          >
            {submitting ? (
              <>
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Сохраняем…
              </>
            ) : isLastStep ? (
              <>
                Завершить
                <PartyPopper className="size-4" aria-hidden="true" />
              </>
            ) : (
              <>
                Далее
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
