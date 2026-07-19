import crypto from "crypto";
import { scrubPII } from "../infrastructure/nvidia/pii-scrubber";

export interface CanonicalDocument {
  text: string;
  sourceHash: string;
}

export function computeSourceHash(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export function buildRoommateEmbeddingDocument(
  profile: {
    displayName?: string;
    city?: string | null;
    age?: number | null;
    jobTitle?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    moveInDate?: string | null;
    leaseMonths?: number | null;
  },
  preferences?: {
    districts?: string[] | null;
    smoking?: string | null;
    pets?: string | null;
    sleepSchedule?: string | null;
    noiseTolerance?: number | null;
    guestsFrequency?: string | null;
    remoteWork?: string | null;
    cleanliness?: number | null;
    privateSpace?: number | null;
    sociability?: number | null;
  } | null,
  lifestyleAnswers?: Array<{ questionKey: string; answer: string }> | null
): CanonicalDocument {
  const cityStr = profile.city ? `Город: ${profile.city}.` : "Город: Краснодар.";
  const budgetStr = `Бюджет: ${profile.budgetMin ?? 0} - ${profile.budgetMax ?? 150000} руб/мес.`;
  const moveInStr = profile.moveInDate ? `Дата заселения: ${profile.moveInDate}.` : "";
  const leaseStr = profile.leaseMonths ? `Срок аренды: ${profile.leaseMonths} месяцев.` : "";
  const jobStr = profile.jobTitle ? `Профессия: ${profile.jobTitle}.` : "";

  const districtsStr = preferences?.districts && preferences.districts.length > 0
    ? `Желаемые районы: ${preferences.districts.sort().join(", ")}.`
    : "";

  const sleepStr = preferences?.sleepSchedule
    ? `Режим сна: ${preferences.sleepSchedule === "early" ? "Жаворонок" : preferences.sleepSchedule === "late" ? "Сова" : "Гибкий"}.`
    : "";

  const smokingStr = preferences?.smoking
    ? `Курение: ${preferences.smoking === "no" ? "Не курит" : "Курит"}.`
    : "";

  const petsStr = preferences?.pets
    ? `Питомцы: ${preferences.pets === "no" ? "Без питомцев" : "Есть питомцы"}.`
    : "";

  const remoteStr = preferences?.remoteWork
    ? `Удалённая работа: ${preferences.remoteWork === "often" ? "Работает из дома" : "Офис"}.`
    : "";

  const cleanlinessStr = preferences?.cleanliness !== undefined && preferences?.cleanliness !== null
    ? `Чистота: ${preferences.cleanliness}/5.`
    : "";

  const sortedAnswers = (lifestyleAnswers ?? [])
    .filter((a) => a.questionKey && a.answer)
    .sort((a, b) => a.questionKey.localeCompare(b.questionKey))
    .map((a) => `${a.questionKey}: ${a.answer}`)
    .join("; ");

  const rawDocumentText = [
    cityStr,
    budgetStr,
    districtsStr,
    moveInStr,
    leaseStr,
    jobStr,
    sleepStr,
    smokingStr,
    petsStr,
    remoteStr,
    cleanlinessStr,
    sortedAnswers ? `Предпочтения: ${sortedAnswers}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  // Ensure document is PII scrubbed and under 4000 tokens limit
  const sanitizedText = scrubPII(rawDocumentText);
  const sourceHash = computeSourceHash(sanitizedText);

  return {
    text: sanitizedText,
    sourceHash,
  };
}

export function buildPropertyEmbeddingDocument(
  property: {
    title: string;
    description?: string | null;
    district: string;
    city?: string | null;
    monthlyRent: number;
    depositAmount?: number | null;
    rooms?: number | null;
    area?: number | null;
    floor?: string | number | null;
    totalFloors?: string | number | null;
  },
  amenities?: string[] | null,
  houseRules?: string[] | null
): CanonicalDocument {
  const cityStr = `Город: ${property.city || "Краснодар"}.`;
  const districtStr = `Район: ${property.district}.`;
  const rentStr = `Аренда: ${property.monthlyRent} руб/мес.`;
  const roomsStr = property.rooms ? `Комнат: ${property.rooms}.` : "";
  const areaStr = property.area ? `Площадь: ${property.area} м².` : "";
  const floorStr = property.floor ? `Этаж: ${property.floor}/${property.totalFloors || ""}.` : "";

  const descStr = property.description ? property.description : "";
  const amenitiesStr = amenities && amenities.length > 0 ? `Удобства: ${amenities.sort().join(", ")}.` : "";
  const rulesStr = houseRules && houseRules.length > 0 ? `Правила: ${houseRules.sort().join(", ")}.` : "";

  const rawDocumentText = [
    property.title,
    cityStr,
    districtStr,
    rentStr,
    roomsStr,
    areaStr,
    floorStr,
    descStr,
    amenitiesStr,
    rulesStr,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const sanitizedText = scrubPII(rawDocumentText);
  const sourceHash = computeSourceHash(sanitizedText);

  return {
    text: sanitizedText,
    sourceHash,
  };
}
