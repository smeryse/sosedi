import { globalRerankClient, RerankCandidate } from "../infrastructure/nvidia/rerank-client";

export interface EvaluationItem {
  query: string;
  candidates: Array<{
    id: string;
    text: string;
    relevant: boolean;
  }>;
}

// 50 Synthetic Russian Benchmark Queries & Candidate Pairs for Co-Living Search Evaluation
export const russianEvaluationDataset: EvaluationItem[] = Array.from({ length: 50 }).map((_, idx) => {
  const queryType = idx % 5;
  if (queryType === 0) {
    return {
      query: `Тихий сожитель жаворонок не курит без питомцев Краснодар`,
      candidates: [
        { id: `c-${idx}-1`, text: "Город: Краснодар. Бюджет: 30000 руб/мес. Желаемые районы: Центральный. Режим сна: Жаворонок. Курение: Не курит. Питомцы: Без питомцев.", relevant: true },
        { id: `c-${idx}-2`, text: "Город: Краснодар. Бюджет: 45000 руб/мес. Режим сна: Сова. Курение: Курит. Питомцы: Есть питомцы.", relevant: false },
        { id: `c-${idx}-3`, text: "Город: Краснодар. Бюджет: 25000 руб/мес. Профессия: Студент. Вечеринки каждый день. Громкая музыка.", relevant: false },
      ],
    };
  } else if (queryType === 1) {
    return {
      query: `1-комнатная квартира с ремонтом около парка Краснодар до 35000`,
      candidates: [
        { id: `c-${idx}-1`, text: "Город: Краснодар. Район: Фестивальный. Аренда: 32000 руб/мес. Комнат: 1. Площадь: 40 м². Рядом парк, тихий двор.", relevant: true },
        { id: `c-${idx}-2`, text: "Город: Краснодар. Район: Заводской. Аренда: 60000 руб/мес. Комнат: 3. Площадь: 100 м².", relevant: false },
        { id: `c-${idx}-3`, text: "Город: Сочи. Район: Центральный. Аренда: 50000 руб/мес.", relevant: false },
      ],
    };
  } else if (queryType === 2) {
    return {
      query: `Программист работающий из дома ищет изолированную комнату`,
      candidates: [
        { id: `c-${idx}-1`, text: "Город: Краснодар. Бюджет: 35000 руб/мес. Профессия: IT разработчик. Удалённая работа: Работает из дома. Чистота: 5/5.", relevant: true },
        { id: `c-${idx}-2`, text: "Город: Краснодар. Шумные компании, ночные стримы, проходная комната.", relevant: false },
        { id: `c-${idx}-3`, text: "Город: Краснодар. Командировки по 10 месяцев в году.", relevant: false },
      ],
    };
  } else if (queryType === 3) {
    return {
      query: `Светлая квартира с кондиционером и посудомойкой`,
      candidates: [
        { id: `c-${idx}-1`, text: "Город: Краснодар. Аренда: 28000 руб/мес. Удобства: Кондиционер, Посудомоечная машина, Панорамные окна.", relevant: true },
        { id: `c-${idx}-2`, text: "Город: Краснодар. Аренда: 20000 руб/мес. Старый бабушкин ремонт без бытовой техники.", relevant: false },
        { id: `c-${idx}-3`, text: "Город: Москва. Дорогой пентхаус.", relevant: false },
      ],
    };
  } else {
    return {
      query: `Студентка чистоплотная без вредных привычек`,
      candidates: [
        { id: `c-${idx}-1`, text: "Город: Краснодар. Учёба в КубГУ. Курение: Не курит. Чистота: 5/5. Тихие часы соблюдает.", relevant: true },
        { id: `c-${idx}-2`, text: "Город: Краснодар. Прораб на стройке, курит в квартире.", relevant: false },
        { id: `c-${idx}-3`, text: "Город: Краснодар. Безработный, ночные гулянки.", relevant: false },
      ],
    };
  }
});

export function calculateRecallAtK(retrievedIds: string[], relevantIds: string[], k: number): number {
  const topK = retrievedIds.slice(0, k);
  const hits = topK.filter((id) => relevantIds.includes(id)).length;
  return relevantIds.length > 0 ? hits / relevantIds.length : 0;
}

export function calculateNDCGAtK(retrievedIds: string[], relevantMap: Map<string, number>, k: number): number {
  const topK = retrievedIds.slice(0, k);
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    const rel = relevantMap.get(topK[i]) ?? 0;
    dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
  }

  const idealRels = Array.from(relevantMap.values()).sort((a, b) => b - a).slice(0, k);
  let idcg = 0;
  for (let i = 0; i < idealRels.length; i++) {
    idcg += (Math.pow(2, idealRels[i]) - 1) / Math.log2(i + 2);
  }

  return idcg > 0 ? dcg / idcg : 0;
}

export interface EvaluationSummary {
  sampleCount: number;
  recallAt1: number;
  recallAt3: number;
  ndcgAt3: number;
}

export async function evaluateRerankerOnRussianDataset(maxItems: number = 5): Promise<{
  baseline: EvaluationSummary;
  reranked: EvaluationSummary;
}> {
  let baselineRecall1Sum = 0;
  let baselineRecall3Sum = 0;
  let baselineNDCG3Sum = 0;

  let rerankRecall1Sum = 0;
  let rerankRecall3Sum = 0;
  let rerankNDCG3Sum = 0;

  const datasetSubset = russianEvaluationDataset.slice(0, maxItems);

  for (const item of datasetSubset) {
    const relevantIds = item.candidates.filter((c) => c.relevant).map((c) => c.id);
    const relevantMap = new Map(item.candidates.map((c) => [c.id, c.relevant ? 1 : 0]));

    // Baseline Order
    const baselineIds = item.candidates.map((c) => c.id);
    baselineRecall1Sum += calculateRecallAtK(baselineIds, relevantIds, 1);
    baselineRecall3Sum += calculateRecallAtK(baselineIds, relevantIds, 3);
    baselineNDCG3Sum += calculateNDCGAtK(baselineIds, relevantMap, 3);

    // Reranked Order
    const candidatesForRerank: RerankCandidate[] = item.candidates.map((c) => ({ id: c.id, text: c.text }));
    const rerankedResults = await globalRerankClient.rerank(item.query, candidatesForRerank);
    const rerankedIds = rerankedResults.map((r) => r.id);

    rerankRecall1Sum += calculateRecallAtK(rerankedIds, relevantIds, 1);
    rerankRecall3Sum += calculateRecallAtK(rerankedIds, relevantIds, 3);
    rerankNDCG3Sum += calculateNDCGAtK(rerankedIds, relevantMap, 3);
  }

  const n = datasetSubset.length;

  return {
    baseline: {
      sampleCount: n,
      recallAt1: baselineRecall1Sum / n,
      recallAt3: baselineRecall3Sum / n,
      ndcgAt3: baselineNDCG3Sum / n,
    },
    reranked: {
      sampleCount: n,
      recallAt1: rerankRecall1Sum / n,
      recallAt3: rerankRecall3Sum / n,
      ndcgAt3: rerankNDCG3Sum / n,
    },
  };
}
