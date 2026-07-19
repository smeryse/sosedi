import { describe, expect, it, beforeEach } from "vitest";
import { parseAPRFeedContent } from "./parser";
import { normalizeAPRItem, getAPRDataFreshness } from "./schema";
import { APRImporter } from "./importer";
import { APRFeedProvider } from "./provider";

describe("AP-R Integration Suite", () => {
  let importer: APRImporter;

  beforeEach(() => {
    importer = new APRImporter();
    importer.clearInMemoryStore();
  });

  describe("Parser & Normalizer", () => {
    it("parses Yandex XML feed correctly", () => {
      const xml = `
        <realty-feed>
          <offer internal-id="test-xml-101">
            <locality-name>Краснодар</locality-name>
            <building-name>ЖК Западный</building-name>
            <developer-name>Ассоциация застройщиков</developer-name>
            <address>ул. Красная, 10</address>
            <category>квартира</category>
            <rooms>2</rooms>
            <area><value>55.5</value></area>
            <price><value>5500000</value></price>
            <ready-quarter>IV кв. 2026</ready-quarter>
            <renovation>Предчистовая</renovation>
            <url>https://ap-r.ru/krasnodar/zhk-zapadny/flat-101</url>
            <photo>https://ap-r.ru/upload/photo1.jpg</photo>
          </offer>
        </realty-feed>
      `;

      const parsed = parseAPRFeedContent(xml, "xml");
      expect(parsed).toHaveLength(1);
      expect(parsed[0].externalId).toBe("test-xml-101");
      expect(parsed[0].city).toBe("Краснодар");
      expect(parsed[0].complexName).toBe("ЖК Западный");
      expect(parsed[0].rooms).toBe("2");

      const normalized = normalizeAPRItem(parsed[0]);
      expect(normalized.source).toBe("ap-r");
      expect(normalized.externalId).toBe("test-xml-101");
      expect(normalized.rooms).toBe(2);
      expect(normalized.area).toBe(55.5);
      expect(normalized.price).toBe(5500000);
      expect(normalized.pricePerSqM).toBe(99099);
      expect(normalized.originalUrl).toBe("https://ap-r.ru/krasnodar/zhk-zapadny/flat-101");
    });

    it("parses JSON feed content correctly", () => {
      const json = JSON.stringify([
        {
          externalId: "json-202",
          city: "Сочи",
          complexName: "ЖК Сочинский Бриз",
          developer: "AP-R Partner",
          price: 9000000,
          area: 30,
          rooms: 1,
        },
      ]);

      const parsed = parseAPRFeedContent(json, "json");
      expect(parsed).toHaveLength(1);

      const normalized = normalizeAPRItem(parsed[0]);
      expect(normalized.city).toBe("Сочи");
      expect(normalized.pricePerSqM).toBe(300000);
    });

    it("parses HTML web-scraped page content correctly", () => {
      const html = `
        <div class="property-card">
          <h2>ЖК Краснодарский Олимп</h2>
          <span class="price">4 500 000 ₽</span>
          <a href="/catalog/krasnodar-olimp">Подробнее</a>
          <img src="https://ap-r.ru/images/olimp.jpg" />
        </div>
      `;

      const parsed = parseAPRFeedContent(html, "html");
      expect(parsed).toHaveLength(1);
      expect(parsed[0].complexName).toBe("ЖК Краснодарский Олимп");
      expect(parsed[0].price).toBe(4500000);

      const normalized = normalizeAPRItem(parsed[0]);
      expect(normalized.source).toBe("ap-r");
      expect(normalized.originalUrl).toBe("https://ap-r.ru/catalog/krasnodar-olimp");
    });
  });

  describe("Idempotent Ingestion & Re-import", () => {
    it("runs initial import and subsequent re-import without duplicates", async () => {
      const jsonContent = JSON.stringify([
        {
          externalId: "item-1",
          city: "Краснодар",
          complexName: "ЖК Южный",
          price: 4000000,
          area: 40,
          rooms: 1,
        },
        {
          externalId: "item-2",
          city: "Анапа",
          complexName: "ЖК Морской",
          price: 5000000,
          area: 50,
          rooms: 2,
        },
      ]);

      // First run
      const res1 = await importer.runImport({ rawContent: jsonContent, format: "json" });
      expect(res1.status).toBe("success");
      expect(res1.createdCount).toBe(2);
      expect(res1.updatedCount).toBe(0);
      expect(importer.getInMemoryProperties()).toHaveLength(2);

      // Re-run with exact same data (no changes)
      const res2 = await importer.runImport({ rawContent: jsonContent, format: "json" });
      expect(res2.status).toBe("success");
      expect(res2.createdCount).toBe(0);
      expect(res2.skippedCount).toBe(2); // Skipped because data didn't change
      expect(importer.getInMemoryProperties()).toHaveLength(2); // No duplicates created!

      // Update one item price
      const updatedJson = JSON.stringify([
        {
          externalId: "item-1",
          city: "Краснодар",
          complexName: "ЖК Южный",
          price: 4200000, // Price updated
          area: 40,
          rooms: 1,
        },
        {
          externalId: "item-2",
          city: "Анапа",
          complexName: "ЖК Морской",
          price: 5000000,
          area: 50,
          rooms: 2,
        },
      ]);

      const res3 = await importer.runImport({ rawContent: updatedJson, format: "json" });
      expect(res3.createdCount).toBe(0);
      expect(res3.updatedCount).toBe(1);
      expect(res3.skippedCount).toBe(1);

      const item1 = importer.getInMemoryProperties().find((p) => p.externalId === "item-1");
      expect(item1?.price).toBe(4200000);
    });

    it("marks missing properties as inactive when feed omits them", async () => {
      const initialJson = JSON.stringify([
        { externalId: "p1", city: "Краснодар", price: 3000000, area: 30 },
        { externalId: "p2", city: "Сочи", price: 6000000, area: 30 },
      ]);

      await importer.runImport({ rawContent: initialJson, format: "json" });

      // Feed with only p1
      const nextJson = JSON.stringify([
        { externalId: "p1", city: "Краснодар", price: 3000000, area: 30 },
      ]);

      await importer.runImport({ rawContent: nextJson, format: "json", markMissingAsInactive: true });

      const all = importer.getInMemoryProperties();
      const p1 = all.find((x) => x.externalId === "p1");
      const p2 = all.find((x) => x.externalId === "p2");

      expect(p1?.isAvailable).toBe(true);
      expect(p2?.isAvailable).toBe(false); // Marked inactive instead of deleted!
    });
  });

  describe("Freshness & Stale Detection", () => {
    it("flags data older than threshold as stale ('нужно уточнить')", () => {
      const nowMs = Date.now();
      const freshDateIso = new Date(nowMs - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days old
      const staleDateIso = new Date(nowMs - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days old

      const freshStatus = getAPRDataFreshness(freshDateIso, 7, nowMs);
      expect(freshStatus.isStale).toBe(false);
      expect(freshStatus.displayNote).toBe("актуально");

      const staleStatus = getAPRDataFreshness(staleDateIso, 7, nowMs);
      expect(staleStatus.isStale).toBe(true);
      expect(staleStatus.displayNote).toBe("нужно уточнить");
    });
  });

  describe("Provider Fallback & Error Handling", () => {
    it("loads fallback data when no feed URL is configured", async () => {
      const provider = new APRFeedProvider({});
      const { items, rawCount } = await provider.fetchAndNormalize();
      expect(rawCount).toBeGreaterThan(0);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].source).toBe("ap-r");
    });
  });
});
