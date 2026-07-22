import { getNvidiaConfig } from "../../config/nvidia-config";
import { globalNvidiaClient } from "./nvidia-client";
import { NvidiaApiError } from "./nvidia-errors";
import { scrubPII } from "./pii-scrubber";

export interface EmbeddingRequestOptions {
  inputType?: "passage" | "query";
}

export interface NvidiaEmbeddingResponse {
  data: Array<{
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class EmbeddingClient {
  private readonly config = getNvidiaConfig();

  public async getEmbeddings(
    texts: string[],
    options: EmbeddingRequestOptions = {}
  ): Promise<number[][]> {
    if (!this.config.embeddingsEnabled) {
      throw new NvidiaApiError("NVIDIA Embeddings API выключен в конфигурации.");
    }

    if (!texts || texts.length === 0) {
      return [];
    }

    const inputType = options.inputType ?? "passage";

    // Scrub PII & truncate excessively long string to stay under ~4000 tokens
    const scrubbedTexts = texts.map((t) => {
      const clean = scrubPII(t);
      // Rough character limit safeguard (16,000 chars ~ 3500 Russian tokens)
      return clean.length > 16000 ? clean.substring(0, 16000) : clean;
    });

    const endpointUrl = `${this.config.baseUrl}/embeddings`;

    const payload = {
      model: this.config.embedModel,
      input: scrubbedTexts,
      input_type: inputType,
      encoding_format: "float",
      truncate: "NONE",
    };

    const res = await globalNvidiaClient.post<NvidiaEmbeddingResponse>(endpointUrl, payload);

    if (!res || !res.data || !Array.isArray(res.data)) {
      throw new NvidiaApiError("NVIDIA Embeddings API вернул некорректную структуру ответа.");
    }

    // Sort by index to match order
    const sorted = [...res.data].sort((a, b) => a.index - b.index);

    const vectors: number[][] = [];
    for (const item of sorted) {
      if (!item.embedding || item.embedding.length !== 2048) {
        throw new NvidiaApiError(
          `Неверная размерность вектора: ожидалось 2048, получено ${item.embedding?.length ?? 0}`
        );
      }
      vectors.push(item.embedding);
    }

    return vectors;
  }

  public async getSingleEmbedding(text: string, options: EmbeddingRequestOptions = {}): Promise<number[]> {
    const results = await this.getEmbeddings([text], options);
    return results[0];
  }
}

export const globalEmbeddingClient = new EmbeddingClient();
