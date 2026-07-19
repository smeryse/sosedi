import { createClient } from "@/lib/supabase/client";
import { globalContentSafetyClient, ModerationResult } from "@/lib/infrastructure/nvidia/content-safety-client";
import { computeSourceHash } from "./canonical-document-service";

export interface ModerationEventRecord {
  id: string;
  entityType: "profile" | "property" | "message" | "image";
  entityId: string;
  userId?: string;
  model: string;
  inputHash: string;
  result: "approved" | "flagged" | "blocked" | "review_required";
  labels: Record<string, any>;
  severity: "low" | "medium" | "high";
  confidence: number;
  action: "allow" | "flag" | "block" | "review";
  status: "pending" | "approved" | "rejected" | "escalated";
  createdAt: string;
}

export class ModerationQueueService {
  public async moderateAndLog(
    entityType: "profile" | "property" | "message" | "image",
    entityId: string,
    text: string,
    userId?: string
  ): Promise<ModerationResult> {
    const moderation = await globalContentSafetyClient.evaluateTextSafety(text);
    const inputHash = computeSourceHash(text);

    try {
      const supabase = createClient();
      const severity = moderation.action === "block" ? "high" : moderation.action === "review" ? "medium" : "low";

      await (supabase as any).from("moderation_events").insert({
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId || null,
        model: moderation.source === "nvidia" ? "nvidia/nemotron-3.5-content-safety" : "local_rules_fallback",
        input_hash: inputHash,
        result: moderation.result,
        labels: moderation.categories as any,
        severity,
        confidence: moderation.confidence,
        action: moderation.action,
        status: moderation.action === "allow" ? "approved" : "pending",
      });
    } catch (err) {
      console.warn("[Moderation Queue Warning] Failed to persist moderation event to database:", err);
    }

    return moderation;
  }

  public async getModerationQueue(): Promise<ModerationEventRecord[]> {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from("moderation_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        entityType: item.entity_type,
        entityId: item.entity_id,
        userId: item.user_id,
        model: item.model,
        inputHash: item.input_hash,
        result: item.result,
        labels: item.labels ?? {},
        severity: item.severity ?? "low",
        confidence: item.confidence ?? 1.0,
        action: item.action,
        status: item.status ?? "pending",
        createdAt: item.created_at,
      }));
    } catch (err) {
      console.warn("[Moderation Queue Error] Failed to fetch moderation queue:", err);
      return [];
    }
  }

  public async resolveModerationEvent(
    eventId: string,
    action: "approved" | "rejected" | "escalated"
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await (supabase as any)
        .from("moderation_events")
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      return !error;
    } catch (err) {
      console.warn("[Moderation Resolution Error] Failed to resolve moderation event:", err);
      return false;
    }
  }
}

export const globalModerationQueueService = new ModerationQueueService();
