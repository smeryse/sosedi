/**
 * Standalone CLI Script for AP-R Feed & Scraper Integration
 * Usage:
 *   npm run import:apr -- --dry-run
 *   npm run import:apr -- --file ./scraped.html --format html --dry-run
 *   npm run import:apr -- --url https://ap-r.ru/catalog --max-pages 10
 */

import fs from "fs";
import path from "path";
import { defaultAPRImporter } from "../lib/integrations/ap-r/importer";
import { defaultAPRScraper } from "../lib/integrations/ap-r/scraper";

async function main() {
  console.log("==========================================");
  console.log("  AP-R Scraper & Feed Importer (Sosedi)   ");
  console.log("==========================================");

  const args = process.argv.slice(2);
  let filePath: string | null = null;
  let feedUrl: string | null = process.env.APR_API_URL || null;
  let format: "json" | "xml" | "csv" | "html" = "json";
  let dryRun = false;
  let maxPages = 20;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file" && args[i + 1]) {
      filePath = args[i + 1];
      i++;
    } else if (args[i] === "--url" && args[i + 1]) {
      feedUrl = args[i + 1];
      i++;
    } else if (args[i] === "--format" && args[i + 1]) {
      format = args[i + 1] as any;
      i++;
    } else if (args[i] === "--max-pages" && args[i + 1]) {
      maxPages = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  if (dryRun) {
    console.log("🔍 [DRY RUN MODE ACTIVE]: Inspecting & parsing data without writing to database.\n");
  }

  let rawContent: string | undefined = undefined;

  if (filePath) {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    console.log(`Reading source file: ${absolutePath}`);
    if (!fs.existsSync(absolutePath)) {
      console.error(`Error: File not found at ${absolutePath}`);
      process.exit(1);
    }
    rawContent = fs.readFileSync(absolutePath, "utf-8");
  } else if (feedUrl) {
    console.log(`Targeting URL: ${feedUrl}`);
  } else {
    console.log("No specific URL or file given. Running scraper engine with seed datasets...");
  }

  // Run scraper engine
  const scraperResult = await defaultAPRScraper.runScrape({
    dryRun,
    maxPages,
    baseUrl: feedUrl || undefined,
    rawContent,
  });

  // Run importer pipeline
  const importResult = await defaultAPRImporter.runImport({
    feedUrl: feedUrl || undefined,
    rawContent,
    format,
    dryRun,
  });

  console.log("\n==========================================");
  console.log("           SUMMARY EXECUTION REPORT       ");
  console.log("==========================================");
  console.log(`Dry Run Mode:      ${dryRun ? "YES (Preview Only)" : "NO (Database Updated)"}`);
  console.log(`URLs Visited:      ${scraperResult.totalUrlsVisited}`);
  console.log(`Complexes Found:   ${scraperResult.totalComplexesFound}`);
  console.log(`Apartments Found:  ${scraperResult.totalApartmentsFound || importResult.processedCount}`);
  console.log(`New Records:       ${importResult.createdCount}`);
  console.log(`Updated Records:   ${importResult.updatedCount}`);
  console.log(`Skipped Unchanged: ${importResult.skippedCount}`);
  console.log(`Total Errors:      ${importResult.errorCount + scraperResult.errorCount}`);
  console.log(`Started At:        ${importResult.startedAt}`);
  console.log(`Completed At:      ${importResult.completedAt}`);

  if (scraperResult.sampleNormalizedItems.length > 0) {
    console.log("\n--- Sample Normalized Record Preview ---");
    console.log(JSON.stringify(scraperResult.sampleNormalizedItems[0], null, 2));
  }

  if (importResult.errorMessages.length > 0) {
    console.log("\n--- Warnings & Errors ---");
    importResult.errorMessages.forEach((err, idx) => console.log(` [${idx + 1}] ${err}`));
  }

  console.log("==========================================");
}

main().catch((err) => {
  console.error("Fatal error running AP-R scraper/importer:", err);
  process.exit(1);
});
