export function scrubPII(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Email pattern
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]");

  // 2. Phone numbers (RU & International format)
  cleaned = cleaned.replace(/(?:\+?7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g, "[PHONE_REDACTED]");
  cleaned = cleaned.replace(/\+\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/g, "[PHONE_REDACTED]");

  // 3. Russian Passport Series & Number (4 digits space 6 digits)
  cleaned = cleaned.replace(/\b\d{4}\s\d{6}\b/g, "[PASSPORT_REDACTED]");

  // 4. API keys / secret tokens (nvapi-..., Bearer ...)
  cleaned = cleaned.replace(/nvapi-[A-Za-z0-9_-]+/g, "[TOKEN_REDACTED]");

  return cleaned;
}
