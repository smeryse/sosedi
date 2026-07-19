import { createClient } from "@/lib/supabase/client";
import { globalEmbeddingClient } from "@/lib/infrastructure/nvidia/embedding-client";
import { scrubPII } from "@/lib/infrastructure/nvidia/pii-scrubber";

export interface VectorMatchResult<T> {
  entityId: string;
  similarity: number;
  data: T;
  explainReasons: string[];
}

export class VectorSearchService {
  public async searchRoommates(
    queryText: string,
    filters?: { city?: string; maxBudget?: number; limit?: number }
  ): Promise<VectorMatchResult<any>[]> {
    const cleanQuery = scrubPII(queryText || "");
    if (!cleanQuery.trim()) {
      return [];
    }

    try {
      // 1. Generate query embedding using nvidia/nemotron-3-embed-1b with input_type="query"
      const queryVector = await globalEmbeddingClient.getSingleEmbedding(cleanQuery, {
        inputType: "query",
      });

      // 2. Call Supabase RPC match_roommates_vector enforcing hard SQL filters
      const supabase = createClient();
      const { data: matches, error } = await (supabase.rpc as any)("match_roommates_vector", {
        query_embedding: queryVector as any,
        match_threshold: 0.3,
        match_count: filters?.limit ?? 30,
        filter_city: filters?.city ?? null,
        filter_max_budget: filters?.maxBudget ?? null,
      });

      if (error || !matches) {
        console.warn("[Vector Search Warning] RPC match_roommates_vector failed:", error?.message);
        return [];
      }

      return (matches as any[]).map((m: any) => {
        const simPercent = Math.round((m.similarity ?? 0.8) * 100);
        const reasons: string[] = [];
        if (m.city) reasons.push(`Город ${m.city}`);
        if (m.budget_max) reasons.push(`Бюджет до ${m.budget_max} ₽`);
        if (simPercent > 70) reasons.push("Высокое семантическое соответствие описанию");

        return {
          entityId: m.entity_id,
          similarity: m.similarity,
          data: m,
          explainReasons: reasons,
        };
      });
    } catch (err) {
      console.warn("[Vector Search Fallback] Failed to perform vector roommate search:", err);
      return [];
    }
  }

  public async searchProperties(
    queryText: string,
    filters?: { city?: string; maxPrice?: number; limit?: number }
  ): Promise<VectorMatchResult<any>[]> {
    const cleanQuery = scrubPII(queryText || "");
    if (!cleanQuery.trim()) {
      return [];
    }

    try {
      const queryVector = await globalEmbeddingClient.getSingleEmbedding(cleanQuery, {
        inputType: "query",
      });

      const supabase = createClient();
      const { data: matches, error } = await (supabase.rpc as any)("match_properties_vector", {
        query_embedding: queryVector as any,
        match_threshold: 0.3,
        match_count: filters?.limit ?? 30,
        filter_city: filters?.city ?? null,
        filter_max_price: filters?.maxPrice ?? null,
      });

      if (error || !matches) {
        console.warn("[Vector Search Warning] RPC match_properties_vector failed:", error?.message);
        return [];
      }

      return (matches as any[]).map((m: any) => {
        const reasons: string[] = [];
        if (m.city) reasons.push(`Город ${m.city}`);
        if (m.district) reasons.push(`Район ${m.district}`);
        if (m.monthly_rent) reasons.push(`Цена ${m.monthly_rent} ₽/мес`);
        reasons.push("Семантическое соответствие запросу поиска жилья");

        return {
          entityId: m.entity_id,
          similarity: m.similarity,
          data: m,
          explainReasons: reasons,
        };
      });
    } catch (err) {
      console.warn("[Vector Search Fallback] Failed to perform vector property search:", err);
      return [];
    }
  }
}

export const globalVectorSearchService = new VectorSearchService();
