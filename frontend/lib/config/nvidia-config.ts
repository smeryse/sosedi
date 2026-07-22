// Helper to auto-load .env.local on server side if process.env values are not set
function autoLoadEnv() {
  if (typeof window !== "undefined") return;
  try {
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      // eslint-disable-next-line no-eval
      const req = eval("require");
      const fs = req("fs");
      const path = req("path");
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const idx = trimmed.indexOf("=");
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
}

autoLoadEnv();

export interface NvidiaConfig {
  apiKey: string;
  baseUrl: string;
  retrievalBaseUrl: string;
  embedModel: string;
  rerankModel: string;
  safetyModel: string;
  bnrGrpcTarget: string;
  bnrFunctionId: string;
  aiEnabled: boolean;
  embeddingsEnabled: boolean;
  rerankEnabled: boolean;
  safetyEnabled: boolean;
  bnrEnabled: boolean;
  asrEnabled: boolean;
  ocrEnabled: boolean;
  requestTimeoutMs: number;
  maxRetries: number;
  rateLimitPerMin: number;
}

export function getNvidiaConfig(): NvidiaConfig {
  const apiKey = process.env.NVIDIA_API_KEY || "";
  const baseUrl = process.env.NVIDIA_API_BASE_URL || "https://integrate.api.nvidia.com/v1";
  const retrievalBaseUrl = process.env.NVIDIA_RETRIEVAL_BASE_URL || "https://ai.api.nvidia.com/v1/retrieval/nvidia";
  
  const embedModel = process.env.NVIDIA_EMBED_MODEL || "nvidia/nemotron-3-embed-1b";
  const rerankModel = process.env.NVIDIA_RERANK_MODEL || "nvidia/rerank-qa-mistral-4b";
  const safetyModel = process.env.NVIDIA_SAFETY_MODEL || "nvidia/nemotron-3.5-content-safety";
  
  const bnrGrpcTarget = process.env.NVIDIA_BNR_GRPC_TARGET || "grpc.nvcf.nvidia.com:443";
  const bnrFunctionId = process.env.NVIDIA_BNR_FUNCTION_ID || "180da92c-fbce-4279-8588-46637ef69989";

  const aiEnabled = process.env.NVIDIA_AI_ENABLED !== "false" && Boolean(apiKey);
  const embeddingsEnabled = process.env.NVIDIA_EMBEDDINGS_ENABLED !== "false" && aiEnabled;
  const rerankEnabled = process.env.NVIDIA_RERANK_ENABLED !== "false" && aiEnabled;
  const safetyEnabled = process.env.NVIDIA_SAFETY_ENABLED !== "false" && aiEnabled;
  const bnrEnabled = process.env.NVIDIA_BNR_ENABLED === "true" && aiEnabled;
  
  const asrEnabled = process.env.NVIDIA_ASR_ENABLED === "true";
  const ocrEnabled = process.env.NVIDIA_OCR_ENABLED === "true";

  const requestTimeoutMs = parseInt(process.env.NVIDIA_REQUEST_TIMEOUT_MS || "12000", 10);
  const maxRetries = parseInt(process.env.NVIDIA_MAX_RETRIES || "2", 10);
  const rateLimitPerMin = parseInt(process.env.NVIDIA_RATE_LIMIT_PER_MIN || "60", 10);

  return {
    apiKey,
    baseUrl,
    retrievalBaseUrl,
    embedModel,
    rerankModel,
    safetyModel,
    bnrGrpcTarget,
    bnrFunctionId,
    aiEnabled,
    embeddingsEnabled,
    rerankEnabled,
    safetyEnabled,
    bnrEnabled,
    asrEnabled,
    ocrEnabled,
    requestTimeoutMs,
    maxRetries,
    rateLimitPerMin,
  };
}

export function getPublicCapabilities() {
  const cfg = getNvidiaConfig();
  return {
    aiEnabled: cfg.aiEnabled,
    embeddingsEnabled: cfg.embeddingsEnabled,
    rerankEnabled: cfg.rerankEnabled,
    safetyEnabled: cfg.safetyEnabled,
    bnrEnabled: cfg.bnrEnabled,
    asrEnabled: false,
    ocrEnabled: false,
  };
}
