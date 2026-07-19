import { describe, expect, it } from "vitest";
import {
  calculateRecallAtK,
  calculateNDCGAtK,
  evaluateRerankerOnRussianDataset,
  russianEvaluationDataset,
} from "./rerank-evaluation";

describe("Phase 2: Reranker & Russian Evaluation Benchmark", () => {
  it("contains 50 synthetic Russian test dataset items", () => {
    expect(russianEvaluationDataset).toHaveLength(50);
    for (const item of russianEvaluationDataset) {
      expect(item.query).toBeDefined();
      expect(item.candidates.length).toBeGreaterThan(0);
      expect(item.candidates.some((c) => c.relevant)).toBe(true);
    }
  });

  it("calculates Recall@K and NDCG@K accurately", () => {
    const retrieved = ["id-1", "id-2", "id-3"];
    const relevant = ["id-1"];
    const relMap = new Map([["id-1", 1], ["id-2", 0], ["id-3", 0]]);

    const recall1 = calculateRecallAtK(retrieved, relevant, 1);
    expect(recall1).toBe(1.0);

    const ndcg3 = calculateNDCGAtK(retrieved, relMap, 3);
    expect(ndcg3).toBeGreaterThan(0.9);
  });

  it("evaluates reranker on Russian dataset gracefully", async () => {
    const res = await evaluateRerankerOnRussianDataset(5);
    expect(res.baseline.sampleCount).toBeGreaterThan(0);
    expect(res.reranked.sampleCount).toBeGreaterThan(0);
    expect(res.reranked.recallAt1).toBeGreaterThanOrEqual(0);
    expect(res.reranked.ndcgAt3).toBeGreaterThanOrEqual(0);
  }, 15000);
});
