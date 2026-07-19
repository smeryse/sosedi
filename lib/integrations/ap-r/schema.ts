import { z } from "zod";
import type { NormalizedAPRProperty, RawAPRFeedItem } from "./types";

export const rawAPRItemSchema = z.object({
  externalId: z.string().min(1, "externalId is required"),
  originalUrl: z.string().optional(),
  city: z.string().optional(),
  complexName: z.string().optional(),
  developer: z.string().optional(),
  address: z.string().optional(),
  propertyType: z.string().optional(),
  rooms: z.union([z.number(), z.string()]).optional(),
  area: z.union([z.number(), z.string()]).optional(),
  floor: z.union([z.number(), z.string()]).optional(),
  totalFloors: z.union([z.number(), z.string()]).optional(),
  price: z.union([z.number(), z.string()]).optional(),
  pricePerSqM: z.union([z.number(), z.string()]).optional(),
  completionDate: z.string().optional(),
  finishing: z.string().optional(),
  images: z.union([z.string(), z.array(z.string())]).optional(),
  latitude: z.union([z.number(), z.string()]).optional(),
  longitude: z.union([z.number(), z.string()]).optional(),
  description: z.string().optional(),
  isAvailable: z.union([z.boolean(), z.string()]).optional(),
  updatedAt: z.string().optional(),
});

export const STALE_DAYS_THRESHOLD_DEFAULT = 7;

/**
 * Normalizes raw input feed data into a strict NormalizedAPRProperty domain entity.
 */
export function normalizeAPRItem(
  raw: RawAPRFeedItem,
  nowIso = new Date().toISOString()
): NormalizedAPRProperty {
  const externalId = String(raw.externalId).trim();
  const city = raw.city?.trim() || "Краснодар";
  const complexName = raw.complexName?.trim() || "Новостройка AP-R";
  const developer = raw.developer?.trim() || "Ассоциация застройщиков";
  const address = raw.address?.trim() || `г. ${city}, ${complexName}`;

  const numRooms = parseNumeric(raw.rooms, 1);
  const rawType = (raw.propertyType || "").toLowerCase();
  let propertyType: "flat" | "studio" | "apartment" = "flat";
  if (rawType.includes("студ") || numRooms === 0) {
    propertyType = "studio";
  } else if (rawType.includes("апарт")) {
    propertyType = "apartment";
  }

  const area = parseNumeric(raw.area, 35.0);
  const price = parseNumeric(raw.price, 3500000);
  const calculatedPricePerSqm = area > 0 ? Math.round(price / area) : 0;
  const pricePerSqM = parseNumeric(raw.pricePerSqM, calculatedPricePerSqm);

  const floor = parseNullableNumeric(raw.floor);
  const totalFloors = parseNullableNumeric(raw.totalFloors);
  const completionDate = raw.completionDate?.trim() || "Сдан / 2026";
  const finishing = raw.finishing?.trim() || "Предчистовая";

  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    images = raw.images.filter((img) => typeof img === "string" && img.trim().length > 0);
  } else if (typeof raw.images === "string" && raw.images.trim().length > 0) {
    images = raw.images.split(",").map((s) => s.trim()).filter(Boolean);
  }

  images = images.map((img) => {
    const trimmed = img.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `https://ap-r.ru${trimmed}`;
    }
    return `https://ap-r.ru/${trimmed}`;
  });

  if (images.length === 0) {
    images = ["/demo/properties/center-loft.jpg"];
  }

  const latitude = parseNullableNumeric(raw.latitude);
  const longitude = parseNullableNumeric(raw.longitude);
  const description = raw.description?.trim() || `Объект в ЖК «${complexName}» от застройщика ${developer}.`;

  let isAvailable = true;
  if (typeof raw.isAvailable === "boolean") {
    isAvailable = raw.isAvailable;
  } else if (typeof raw.isAvailable === "string") {
    const lower = raw.isAvailable.trim().toLowerCase();
    isAvailable = !["false", "0", "sold", "inactive", "нет"].includes(lower);
  }

  const originalUrl =
    raw.originalUrl && raw.originalUrl.startsWith("http")
      ? raw.originalUrl
      : `https://ap-r.ru/catalog/item-${externalId}`;

  return {
    externalId,
    source: "ap-r",
    originalUrl,
    city,
    complexName,
    developer,
    address,
    propertyType,
    rooms: numRooms,
    area,
    floor,
    totalFloors,
    price,
    pricePerSqM,
    completionDate,
    finishing,
    images,
    latitude,
    longitude,
    description,
    isAvailable,
    fetchedAt: nowIso,
    lastCheckedAt: nowIso,
  };
}

/**
 * Checks whether an AP-R listing's data is stale based on lastCheckedAt timestamp.
 */
export function getAPRDataFreshness(
  lastCheckedAtIso: string,
  staleDaysThreshold = STALE_DAYS_THRESHOLD_DEFAULT,
  nowMs = Date.now()
) {
  const lastCheckedMs = new Date(lastCheckedAtIso).getTime();
  const diffDays = Math.floor((nowMs - lastCheckedMs) / (1000 * 60 * 60 * 24));
  const isStale = isNaN(diffDays) || diffDays > staleDaysThreshold;

  return {
    isStale,
    staleDaysThreshold,
    daysOld: isNaN(diffDays) ? 999 : diffDays,
    displayNote: isStale ? "нужно уточнить" : "актуально",
  };
}

function parseNumeric(val: unknown, fallback: number): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/\s+/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

function parseNullableNumeric(val: unknown): number | null {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/\s+/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}
