import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import {
  assertScopedObjectKey,
  createSignedUploadUrl,
  inspectStoredObject,
  STORAGE_BUCKETS,
} from "@/lib/storage";

function fail(error: unknown): NextResponse {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  const message = error instanceof Error ? error.message : "Не удалось обработать аватар";
  const isClientError = /файл|формат|размер|MIME|ключ/i.test(message);
  if (!isClientError) console.error("[profile-avatar]", message);
  return NextResponse.json({ error: isClientError ? message : "Хранилище временно недоступно" }, { status: isClientError ? 400 : 503 });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (
      !body || typeof body.fileName !== "string" || !body.fileName.trim() || body.fileName.length > 255 ||
      typeof body.mimeType !== "string" || body.mimeType.length > 128 ||
      typeof body.size !== "number" || !Number.isSafeInteger(body.size) ||
      typeof body.checksumSha256 !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(body.checksumSha256)
    ) {
      return NextResponse.json({ error: "Проверьте данные файла" }, { status: 400 });
    }
    const signed = await createSignedUploadUrl({
      bucket: STORAGE_BUCKETS.AVATARS,
      ownerId: user.id,
      scopeId: user.id,
      fileName: body.fileName,
      mimeType: body.mimeType,
      size: body.size,
      checksumSha256: body.checksumSha256,
    });
    return NextResponse.json(signed, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (
      !body || typeof body.objectKey !== "string" || typeof body.mimeType !== "string" ||
      typeof body.size !== "number" || !Number.isSafeInteger(body.size) ||
      typeof body.checksumSha256 !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(body.checksumSha256)
    ) {
      return NextResponse.json({ error: "Проверьте ключ файла" }, { status: 400 });
    }
    const objectKey = assertScopedObjectKey(body.objectKey, {
      ownerId: user.id,
      bucket: STORAGE_BUCKETS.AVATARS,
      scopeId: user.id,
    });
    const object = await inspectStoredObject({ bucket: STORAGE_BUCKETS.AVATARS, objectKey });
    if (
      object.size !== body.size || object.mimeType !== body.mimeType.toLowerCase() ||
      object.checksumSha256 !== body.checksumSha256
    ) {
      return NextResponse.json({ error: "Загруженный файл не совпадает с заявленными данными" }, { status: 400 });
    }
    await query(`update profiles set avatar_path = $2, updated_at = now() where id = $1`, [user.id, objectKey]);
    return NextResponse.json({ storagePath: objectKey }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return fail(error);
  }
}
