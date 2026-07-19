import { parseAPRFeedContent } from "./parser";
import { normalizeAPRItem, rawAPRItemSchema } from "./schema";
import type { NormalizedAPRProperty, RawAPRFeedItem } from "./types";

export interface APRFeedProviderConfig {
  feedUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class APRFeedProvider {
  private config: APRFeedProviderConfig;

  constructor(config: APRFeedProviderConfig = {}) {
    this.config = {
      feedUrl: config.feedUrl || process.env.APR_FEED_URL,
      apiKey: config.apiKey || process.env.APR_API_KEY,
      timeoutMs: config.timeoutMs || 10000,
      maxRetries: config.maxRetries || 3,
    };
  }

  /**
   * Downloads and normalizes AP-R properties from HTTP feed or raw file content.
   */
  async fetchAndNormalize(rawContent?: string, format?: "json" | "xml" | "csv" | "html"): Promise<{
    items: NormalizedAPRProperty[];
    errors: string[];
    rawCount: number;
  }> {
    let contentToParse = rawContent;
    const errors: string[] = [];

    // If no direct content passed, download from feedUrl or fallback to sample feed
    if (!contentToParse) {
      if (this.config.feedUrl) {
        contentToParse = await this.downloadFeedWithRetry(this.config.feedUrl);
      } else {
        // Fallback sample data when no feedUrl is set in environment
        contentToParse = JSON.stringify(getFallbackAPRData());
        format = "json";
      }
    }

    const rawItems = parseAPRFeedContent(contentToParse, format);
    const normalizedItems: NormalizedAPRProperty[] = [];
    const nowIso = new Date().toISOString();

    for (let i = 0; i < rawItems.length; i++) {
      const raw = rawItems[i];
      const validation = rawAPRItemSchema.safeParse(raw);
      if (!validation.success) {
        errors.push(`Row ${i + 1} validation failed: ${validation.error.message}`);
        continue;
      }

      try {
        const normalized = normalizeAPRItem(raw, nowIso);
        normalizedItems.push(normalized);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Row ${i + 1} normalization error: ${msg}`);
      }
    }

    return {
      items: normalizedItems,
      errors,
      rawCount: rawItems.length,
    };
  }

  private async downloadFeedWithRetry(url: string): Promise<string> {
    let attempt = 0;
    let delayMs = 1000;
    const maxRetries = this.config.maxRetries || 3;
    const timeoutMs = this.config.timeoutMs || 10000;

    while (attempt < maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const headers: Record<string, string> = {
          "User-Agent": "Sosedi-Housing-Ingestion-Bot/1.0",
          Accept: "text/xml, application/xml, application/json, text/csv, */*",
        };

        if (this.config.apiKey) {
          headers["Authorization"] = `Bearer ${this.config.apiKey}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        return await res.text();
      } catch (error) {
        clearTimeout(timeoutId);
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (attempt >= maxRetries) {
          throw new Error(`Failed to download AP-R feed after ${maxRetries} attempts. Last error: ${errorMsg}`);
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }

    throw new Error("Failed to download AP-R feed.");
  }
}

/**
 * Fallback dataset for AP-R properties in Southern Russia (Краснодар, Сочи, Анапа).
 */
export function getFallbackAPRData(): RawAPRFeedItem[] {
  return [
    {
      externalId: "apr-zhk-flotskiy-101",
      originalUrl: "https://ap-r.ru/krasnodar/zhk-flotskiy/flat-101",
      city: "Краснодар",
      complexName: "ЖК Флотский",
      developer: "Ассоциация застройщиков",
      address: "ул. Российская, 267",
      propertyType: "flat",
      rooms: 1,
      area: 38.5,
      floor: 4,
      totalFloors: 16,
      price: 3850000,
      pricePerSqM: 100000,
      completionDate: "IV кв. 2026",
      finishing: "Предчистовая",
      images: [
        "/demo/properties/center-loft.jpg",
      ],
      description: "Светлая квартира в ЖК Флотский от застройщика AP-R. Эскроу-счета, ипотека от 6%.",
      isAvailable: true,
    },
    {
      externalId: "apr-zhk-morskoy-205",
      originalUrl: "https://ap-r.ru/sochi/zhk-morskoy/flat-205",
      city: "Сочи",
      complexName: "ЖК Морской Бриз",
      developer: "Ассоциация застройщиков",
      address: "Курортный проспект, 108",
      propertyType: "studio",
      rooms: 0,
      area: 28.0,
      floor: 7,
      totalFloors: 24,
      price: 8400000,
      pricePerSqM: 300000,
      completionDate: "I кв. 2027",
      finishing: "Под ключ",
      images: [
        "/demo/properties/center-loft.jpg",
      ],
      description: "Видовая студия у моря с ремонтом под ключ в Сочи. Закрытая территория, бассейны.",
      isAvailable: true,
    },
    {
      externalId: "apr-zhk-anapa-park-312",
      originalUrl: "https://ap-r.ru/anapa/zhk-anapa-park/flat-312",
      city: "Анапа",
      complexName: "ЖК Анапа Парк",
      developer: "Ассоциация застройщиков",
      address: "Астраханская ул., 99",
      propertyType: "flat",
      rooms: 2,
      area: 54.2,
      floor: 5,
      totalFloors: 12,
      price: 6504000,
      pricePerSqM: 120000,
      completionDate: "Сдан",
      finishing: "Предчистовая",
      images: [
        "/demo/properties/center-loft.jpg",
      ],
      description: "Просторная евро-2-комнатная квартира возле моря в Анапе. Готовые ключи.",
      isAvailable: true,
    },
  ];
}
