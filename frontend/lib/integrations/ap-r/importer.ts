import { APRFeedProvider } from "./provider";
import type { APRImportResult, NormalizedAPRProperty } from "./types";

// In-memory fallback repository store for demo / development environments
const inMemoryAPRStore: Map<string, NormalizedAPRProperty> = new Map();
const inMemoryAPRLogs: APRImportResult[] = [];

export interface APRImporterOptions {
  feedUrl?: string;
  rawContent?: string;
  format?: "json" | "xml" | "csv" | "html";
  markMissingAsInactive?: boolean;
  dryRun?: boolean;
}

export class APRImporter {
  private provider: APRFeedProvider;

  constructor(provider?: APRFeedProvider) {
    this.provider = provider || new APRFeedProvider();
  }

  /**
   * Executes full import pipeline: download/parse, validate, idempotent upsert, mark inactive, and audit log.
   */
  async runImport(options: APRImporterOptions = {}): Promise<APRImportResult> {
    const startedAt = new Date().toISOString();
    const markMissing = options.markMissingAsInactive ?? true;
    const isDryRun = options.dryRun ?? false;
    const errorMessages: string[] = [];

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    try {
      const { items, errors, rawCount } = await this.provider.fetchAndNormalize(
        options.rawContent,
        options.format
      );

      processedCount = rawCount;
      errorMessages.push(...errors);
      errorCount += errors.length;

      const incomingExternalIds = new Set<string>();

      for (const item of items) {
        incomingExternalIds.add(item.externalId);
        try {
          const status = await this.upsertSingleProperty(item, isDryRun);
          if (status === "created") {
            createdCount++;
          } else if (status === "updated") {
            updatedCount++;
          } else {
            skippedCount++;
          }
        } catch (err) {
          errorCount++;
          const msg = err instanceof Error ? err.message : String(err);
          errorMessages.push(`Upsert error for ID ${item.externalId}: ${msg}`);
        }
      }

      // Mark missing items as inactive
      if (markMissing && incomingExternalIds.size > 0 && !isDryRun) {
        const markedInactive = await this.markMissingPropertiesInactive(incomingExternalIds);
        if (markedInactive > 0) {
          updatedCount += markedInactive;
        }
      }

      const completedAt = new Date().toISOString();
      const status: "success" | "partial_success" | "failed" =
        errorCount === 0
          ? "success"
          : createdCount > 0 || updatedCount > 0
          ? "partial_success"
          : "failed";

      const importResult: APRImportResult = {
        id: `log-${Date.now()}`,
        status,
        processedCount,
        createdCount,
        updatedCount,
        skippedCount,
        errorCount,
        startedAt,
        completedAt,
        errorMessages,
      };

      await this.saveImportLog(importResult);
      return importResult;
    } catch (fatalError) {
      const completedAt = new Date().toISOString();
      const fatalMsg = fatalError instanceof Error ? fatalError.message : String(fatalError);
      errorMessages.push(`Fatal pipeline error: ${fatalMsg}`);

      const failedResult: APRImportResult = {
        id: `log-${Date.now()}`,
        status: "failed",
        processedCount,
        createdCount,
        updatedCount,
        skippedCount,
        errorCount: errorCount + 1,
        startedAt,
        completedAt,
        errorMessages,
      };

      await this.saveImportLog(failedResult);
      return failedResult;
    }
  }

  /**
   * Idempotent upsert logic for a single NormalizedAPRProperty.
   */
  private async upsertSingleProperty(item: NormalizedAPRProperty, isDryRun = false): Promise<"created" | "updated" | "skipped"> {
    const existing = inMemoryAPRStore.get(item.externalId);

    if (!existing) {
      if (!isDryRun) {
        inMemoryAPRStore.set(item.externalId, {
          ...item,
          id: `apr-${item.externalId}`,
        });
      }
      return "created";
    }

    // Check if any normalized fields have changed
    const hasChanged =
      existing.price !== item.price ||
      existing.isAvailable !== item.isAvailable ||
      existing.city !== item.city ||
      existing.complexName !== item.complexName ||
      existing.rooms !== item.rooms ||
      existing.area !== item.area ||
      existing.description !== item.description ||
      existing.originalUrl !== item.originalUrl ||
      JSON.stringify(existing.images) !== JSON.stringify(item.images);

    if (hasChanged) {
      if (!isDryRun) {
        inMemoryAPRStore.set(item.externalId, {
          ...existing,
          ...item,
          lastCheckedAt: item.fetchedAt,
        });
      }
      return "updated";
    }

    // Still update lastCheckedAt timestamp even if fields didn't change
    if (!isDryRun) {
      inMemoryAPRStore.set(item.externalId, {
        ...existing,
        lastCheckedAt: item.fetchedAt,
      });
    }
    return "skipped";
  }

  private async markMissingPropertiesInactive(activeExternalIds: Set<string>): Promise<number> {
    let count = 0;
    for (const [extId, item] of inMemoryAPRStore.entries()) {
      if (!activeExternalIds.has(extId) && item.isAvailable) {
        inMemoryAPRStore.set(extId, {
          ...item,
          isAvailable: false,
          lastCheckedAt: new Date().toISOString(),
        });
        count++;
      }
    }
    return count;
  }

  private async saveImportLog(log: APRImportResult): Promise<void> {
    inMemoryAPRLogs.unshift(log);
  }

  public getInMemoryProperties(): NormalizedAPRProperty[] {
    return Array.from(inMemoryAPRStore.values());
  }

  public getInMemoryLogs(): APRImportResult[] {
    return [...inMemoryAPRLogs];
  }

  public clearInMemoryStore(): void {
    inMemoryAPRStore.clear();
    inMemoryAPRLogs.length = 0;
  }
}

export const defaultAPRImporter = new APRImporter();
