import { getNvidiaConfig } from "../../config/nvidia-config";
import { globalNvidiaClient } from "./nvidia-client";
import { scrubPII } from "./pii-scrubber";

export interface RerankCandidate {
  id: string;
  text: string;
}

export interface RerankResultItem {
  id: string;
  index: number;
  score: number;
}

export interface NvidiaRerankResponse {
  rankings?: Array<{
    index: number;
    logit?: number;
    score?: number;
  }>;
  data?: Array<{
    index: number;
    logit?: number;
    score?: number;
  }>;
}

export class RerankClient {
  private readonly config = getNvidiaConfig();

  public async rerank(
    queryText: string,
    candidates: RerankCandidate[]
  ): Promise<RerankResultItem[]> {
    if (!this.config.rerankEnabled) {
      // Return original order with default index scores
      return candidates.map((c, idx) => ({ id: c.id, index: idx, score: 1 - idx * 0.05 }));
    }

    if (!candidates || candidates.length === 0) {
      return [];
    }

    // Limit to max 30 candidates for optimal latency & context window
    const limitedCandidates = candidates.slice(0, 30);
    const cleanQuery = scrubPII(queryText);

    const passages = limitedCandidates.map((c) => ({
      text: scrubPII(c.text.substring(0, 1500)),
    }));

    // Mandatory URL: POST https://ai.api.nvidia.com/v1/retrieval/nvidia/reranking
    const endpointUrl = `${this.config.retrievalBaseUrl}/reranking`;

    const payload = {
      model: this.config.rerankModel,
      query: { text: cleanQuery },
      passages,
    };

    try {
      const res = await globalNvidiaClient.post<NvidiaRerankResponse>(endpointUrl, payload, {
        timeoutMs: 8000,
      });

      const items = res.rankings || res.data || [];
      if (!Array.isArray(items) || items.length === 0) {
        return limitedCandidates.map((c, idx) => ({ id: c.id, index: idx, score: 1 - idx * 0.05 }));
      }

      const results: RerankResultItem[] = items.map((item) => {
        const idx = item.index;
        const candidate = limitedCandidates[idx] || limitedCandidates[0];
        const score = item.score ?? item.logit ?? 0;
        return {
          id: candidate.id,
          index: idx,
          score,
        };
      });

      // Sort descending by score
      results.sort((a, b) => b.score - a.score);
      return results;
    } catch (err) {
      console.warn("[Reranker Fallback] NVIDIA Reranking API call failed or timed out. Falling back to original vector order:", err);
      return limitedCandidates.map((c, idx) => ({ id: c.id, index: idx, score: 1 - idx * 0.05 }));
    }
  }
}

export const globalRerankClient = new RerankClient();
