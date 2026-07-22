import { NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";
import {
  assertScopedObjectKey,
  createSignedUploadUrl,
  inspectStoredObject,
  STORAGE_BUCKETS,
} from "@/lib/storage";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(error: unknown): NextResponse {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  const message = error instanceof Error ? error.message : "Не удалось обработать фотографию";
  const isClientError = /объект|файл|формат|размер|MIME|ключ|фотограф/i.test(message);
  if (!isClientError) console.error("[property-images]", message);
  return NextResponse.json({ error: isClientError ? message : "Хранилище временно недоступно" }, { status: isClientError ? 400 : 503 });
}

async function requireOwnedProperty(propertyId: string, ownerId: string): Promise<void> {
  const result = await query(
    `select 1 from properties where id = $1 and owner_id = $2 and status <> 'archived'`,
    [propertyId, ownerId],
  );
  if (!result.rowCount) throw new Error("Объект не найден");
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("landlord", "admin");
    const { id: propertyId } = await params;
    if (!UUID_PATTERN.test(propertyId)) return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
    await requireOwnedProperty(propertyId, user.id);
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
      bucket: STORAGE_BUCKETS.PROPERTY_IMAGES,
      ownerId: user.id,
      scopeId: propertyId,
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("landlord", "admin");
    const { id: propertyId } = await params;
    if (!UUID_PATTERN.test(propertyId)) return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
    await requireOwnedProperty(propertyId, user.id);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (
      !body || typeof body.objectKey !== "string" || typeof body.altText !== "string" ||
      typeof body.mimeType !== "string" || typeof body.size !== "number" || !Number.isSafeInteger(body.size) ||
      typeof body.checksumSha256 !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(body.checksumSha256)
    ) {
      return NextResponse.json({ error: "Проверьте данные фотографии" }, { status: 400 });
    }
    const objectKey = assertScopedObjectKey(body.objectKey, {
      ownerId: user.id,
      bucket: STORAGE_BUCKETS.PROPERTY_IMAGES,
      scopeId: propertyId,
    });
    const object = await inspectStoredObject({ bucket: STORAGE_BUCKETS.PROPERTY_IMAGES, objectKey });
    if (
      object.size !== body.size || object.mimeType !== body.mimeType.toLowerCase() ||
      object.checksumSha256 !== body.checksumSha256
    ) {
      return NextResponse.json({ error: "Загруженный файл не совпадает с заявленными данными" }, { status: 400 });
    }
    const altText = body.altText;
    const image = await withTransaction(async (client) => {
      await client.query(`select id from properties where id = $1 and owner_id = $2 for update`, [propertyId, user.id]);
      const count = await client.query<{ count: number }>(
        `select count(*)::int as count from property_images where property_id = $1`,
        [propertyId],
      );
      if (count.rows[0].count >= 30) throw new Error("Можно добавить не более 30 фотографий");
      const existing = await client.query<{ id: string }>(
        `select id from property_images where storage_path = $1`,
        [objectKey],
      );
      if (existing.rows[0]) return existing.rows[0];
      const result = await client.query(
        `insert into property_images
          (property_id, storage_path, alt_text, is_main, sort_order, uploaded_by)
         values ($1, $2, $3, $4, $5, $6) returning *`,
        [propertyId, objectKey, altText.trim().slice(0, 240), count.rows[0].count === 0, count.rows[0].count, user.id],
      );
      return result.rows[0];
    });
    return NextResponse.json({ image }, { status: 201, headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return fail(error);
  }
}
