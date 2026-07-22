import { getNvidiaConfig } from "../../config/nvidia-config";
import { globalNvidiaClient } from "./nvidia-client";
import { scrubPII } from "./pii-scrubber";

export interface ModerationResult {
  allowed: boolean;
  action: "allow" | "flag" | "block" | "review";
  result: "approved" | "flagged" | "blocked" | "review_required";
  categories: {
    profanity: boolean;
    contactLeak: boolean;
    fraud: boolean;
    hate: boolean;
    violence: boolean;
    sexual: boolean;
  };
  confidence: number;
  reason?: string;
  source: "nvidia" | "local_rules_fallback";
}

// Local Russian Rule Engine Fallback Patterns
const RUSSIAN_PROFANITY_REGEX = /(?:мат|блять|хуй|пизд|ебать|сука|гандон|шлюха|мудак)/i;
const CONTACT_LEAK_REGEX = /(?:\b(?:telegram|телеграм|тг|tg|whatsapp|ватсап|vk|вк|звони|пиши)\b|@\w{3,}|\bтел(?:\.|ефон)?\b)/i;
const FRAUD_REGEX = /(?:предоплата|карту|паспорт|переведи|без просмотра|залог до встречи|крипта|usdt)/i;

export function evaluateLocalRules(text: string): ModerationResult {
  const hasProfanity = RUSSIAN_PROFANITY_REGEX.test(text);
  const hasContactLeak = CONTACT_LEAK_REGEX.test(text);
  const hasFraud = FRAUD_REGEX.test(text);

  let action: "allow" | "flag" | "block" | "review" = "allow";
  let resultStatus: "approved" | "flagged" | "blocked" | "review_required" = "approved";

  if (hasProfanity || hasFraud) {
    action = "block";
    resultStatus = "blocked";
  } else if (hasContactLeak) {
    action = "review";
    resultStatus = "review_required";
  }

  return {
    allowed: action === "allow",
    action,
    result: resultStatus,
    categories: {
      profanity: hasProfanity,
      contactLeak: hasContactLeak,
      fraud: hasFraud,
      hate: false,
      violence: false,
      sexual: false,
    },
    confidence: 0.95,
    reason: hasProfanity
      ? "Обнаружена ненормативная лексика"
      : hasFraud
      ? "Подозрение на мошенничество / требования предоплаты"
      : hasContactLeak
      ? "Попытка увести в сторонний мессенджер"
      : undefined,
    source: "local_rules_fallback",
  };
}

export class ContentSafetyClient {
  private readonly config = getNvidiaConfig();

  public async evaluateTextSafety(text: string): Promise<ModerationResult> {
    if (!text || !text.trim()) {
      return {
        allowed: true,
        action: "allow",
        result: "approved",
        categories: { profanity: false, contactLeak: false, fraud: false, hate: false, violence: false, sexual: false },
        confidence: 1.0,
        source: "local_rules_fallback",
      };
    }

    // Always check local Russian rules first as a safety net
    const localResult = evaluateLocalRules(text);
    if (!localResult.allowed) {
      return localResult;
    }

    if (!this.config.safetyEnabled) {
      return localResult;
    }

    try {
      const endpointUrl = `${this.config.baseUrl}/chat/completions`;
      const cleanText = scrubPII(text);

      const payload = {
        model: this.config.safetyModel,
        messages: [
          {
            role: "user",
            content: `Analyze safety of the following text and determine if it contains harmful, illegal, abusive or unsafe material:\n\n${cleanText}`,
          },
        ],
        temperature: 0.0,
        max_tokens: 256,
      };

      const res = await globalNvidiaClient.post<any>(endpointUrl, payload, { timeoutMs: 6000 });
      const replyContent = res.choices?.[0]?.message?.content || "";

      const lower = replyContent.toLowerCase();
      const isUnsafe = lower.includes("unsafe") || lower.includes("flagged") || lower.includes("violation");

      if (isUnsafe) {
        return {
          allowed: false,
          action: "block",
          result: "blocked",
          categories: {
            profanity: false,
            contactLeak: false,
            fraud: false,
            hate: lower.includes("hate"),
            violence: lower.includes("violence"),
            sexual: lower.includes("sexual"),
          },
          confidence: 0.9,
          reason: replyContent.slice(0, 200),
          source: "nvidia",
        };
      }

      return {
        allowed: true,
        action: "allow",
        result: "approved",
        categories: { profanity: false, contactLeak: false, fraud: false, hate: false, violence: false, sexual: false },
        confidence: 0.98,
        source: "nvidia",
      };
    } catch (err) {
      console.warn("[Content Safety Fallback] NVIDIA Safety API call failed, using local rule engine fallback:", err);
      return localResult;
    }
  }
}

export const globalContentSafetyClient = new ContentSafetyClient();
