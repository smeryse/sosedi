import "server-only";

const WEBHOOK_TIMEOUT_MS = 5_000;

async function sendTransactionalEmail(
  template: "password-reset" | "email-verification",
  email: string,
  actionUrl: string,
  requestOrigin: string,
): Promise<void> {
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  if (!webhookUrl) return;

  const configuredOrigin = process.env.APP_URL;
  if (process.env.NODE_ENV === "production" && !configuredOrigin) {
    throw new Error("APP_URL is required to send password reset links in production");
  }

  const appOrigin = (configuredOrigin ?? requestOrigin).replace(/\/$/, "");
  const absoluteActionUrl = `${appOrigin}${actionUrl}`;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.EMAIL_WEBHOOK_SECRET
        ? { authorization: `Bearer ${process.env.EMAIL_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify({
      template,
      to: email,
      variables: {
        actionUrl: absoluteActionUrl,
        ...(template === "password-reset"
          ? { resetUrl: absoluteActionUrl }
          : { verificationUrl: absoluteActionUrl }),
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Email webhook failed with status ${response.status}`);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  requestOrigin: string,
): Promise<void> {
  await sendTransactionalEmail(
    "password-reset",
    email,
    `/auth/update-password?token=${encodeURIComponent(token)}`,
    requestOrigin,
  );
}

export async function sendEmailVerification(
  email: string,
  token: string,
  requestOrigin: string,
): Promise<void> {
  await sendTransactionalEmail(
    "email-verification",
    email,
    `/auth/confirm?token=${encodeURIComponent(token)}`,
    requestOrigin,
  );
}
