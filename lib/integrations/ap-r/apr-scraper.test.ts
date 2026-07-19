import { describe, expect, it, beforeEach } from "vitest";
import { APRWebScraper, APRScraper } from "./scraper";
import { APRImporter } from "./importer";

describe("AP-R Web Scraper Module Suite", () => {
  let scraper: APRScraper;
  let importer: APRImporter;

  beforeEach(() => {
    scraper = new APRWebScraper();
    importer = new APRImporter();
    importer.clearInMemoryStore();
  });

  describe("HTML & JSON-LD Extractor", () => {
    it("extracts structured items from HTML page containing JSON-LD", () => {
      const htmlWithJsonLd = `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@type": "Product",
                "name": "ЖК Апшеронский Квартал",
                "sku": "apr-ld-777",
                "url": "https://ap-r.ru/objects/apsheronsk-777",
                "description": "Элитные квартиры в Апшеронске от AP-R",
                "offers": {
                  "price": 5200000
                },
                "brand": {
                  "name": "ЮгСтройИмпериал"
                },
                "address": {
                  "addressLocality": "Краснодар",
                  "streetAddress": "ул. Ленина, 150"
                }
              }
            </script>
          </head>
          <body><h1>Каталог AP-R</h1></body>
        </html>
      `;

      const extracted = scraper.extractItemsFromContent(htmlWithJsonLd, "https://ap-r.ru/objects");
      expect(extracted).toHaveLength(1);
      expect(extracted[0].externalId).toBe("apr-ld-777");
      expect(extracted[0].complexName).toBe("ЖК Апшеронский Квартал");
      expect(extracted[0].developer).toBe("ЮгСтройИмпериал");
      expect(extracted[0].price).toBe(5200000);
      expect(extracted[0].originalUrl).toBe("https://ap-r.ru/objects/apsheronsk-777");
    });

    it("handles incomplete cards with robust fallback defaults", () => {
      const incompleteHtml = `
        <div class="property-card">
          <h2>ЖК Без Названия</h2>
        </div>
      `;

      const extracted = scraper.extractItemsFromContent(incompleteHtml, "https://ap-r.ru/incomplete");
      expect(extracted).toHaveLength(1);
      expect(extracted[0].complexName).toBe("ЖК Без Названия");
      expect(extracted[0].price).toBe(3500000); // Fallback price
    });
  });

  describe("SHA-256 Hashing & Deduplication", () => {
    it("computes deterministic SHA-256 content hashes", () => {
      const content = { title: "ЖК Южный", price: 4000000 };
      const hash1 = scraper.computeHash(content);
      const hash2 = scraper.computeHash(content);
      const hash3 = scraper.computeHash({ title: "ЖК Южный", price: 4200000 });

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });
  });

  describe("Dry-Run Mode & Execution Pipeline", () => {
    it("runs scrape job in dry-run mode without modifying store", async () => {
      const mockContent = `
        <div class="property-card">
          <h2>ЖК Супсех Резиденс</h2>
          <span class="price">6 100 000 ₽</span>
        </div>
      `;

      const dryRunResult = await scraper.runScrape({
        rawContent: mockContent,
        dryRun: true,
      });

      expect(dryRunResult.dryRun).toBe(true);
      expect(dryRunResult.totalApartmentsFound).toBe(1);
      expect(dryRunResult.sampleNormalizedItems).toHaveLength(1);
      expect(dryRunResult.sampleNormalizedItems[0].complexName).toBe("ЖК Супсех Резиденс");

      // Verify importer in dry-run mode does not modify in-memory store
      const importRes = await importer.runImport({
        rawContent: mockContent,
        format: "html",
        dryRun: true,
      });

      expect(importRes.createdCount).toBe(1);
      expect(importer.getInMemoryProperties()).toHaveLength(0); // 0 in store because dry-run was true!
    });

    it("handles price updates idempotently upon re-run without duplicate creation", async () => {
      const initialHtml = `
        <div class="property-card">
          <h2>ЖК Флагман</h2>
          <span class="price">5 000 000 ₽</span>
          <a href="/catalog/flagman-1">Ссылка</a>
        </div>
      `;

      // 1st Run (normal mode)
      const res1 = await importer.runImport({ rawContent: initialHtml, format: "html", dryRun: false });
      expect(res1.createdCount).toBe(1);
      expect(importer.getInMemoryProperties()).toHaveLength(1);

      // 2nd Run (identical data)
      const res2 = await importer.runImport({ rawContent: initialHtml, format: "html", dryRun: false });
      expect(res2.createdCount).toBe(0);
      expect(res2.skippedCount).toBe(1);
      expect(importer.getInMemoryProperties()).toHaveLength(1); // No duplicates!

      // 3rd Run (price updated)
      const updatedHtml = `
        <div class="property-card">
          <h2>ЖК Флагман</h2>
          <span class="price">5 400 000 ₽</span>
          <a href="/catalog/flagman-1">Ссылка</a>
        </div>
      `;

      const res3 = await importer.runImport({ rawContent: updatedHtml, format: "html", dryRun: false });
      expect(res3.createdCount).toBe(0);
      expect(res3.updatedCount).toBe(1);

      const item = importer.getInMemoryProperties().find((x) => x.complexName === "ЖК Флагман");
      expect(item?.price).toBe(5400000);
    });
  });
});
