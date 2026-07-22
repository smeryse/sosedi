import { AuthError, requireUser } from "@/lib/auth/session";
import {
  canAccessConversation,
  createPendingAttachment,
  findOwnedPendingAttachment,
  setPendingAttachmentStatus,
} from "@/lib/storage/attachment-access";
import {
  assertScopedObjectKey,
  createSignedUploadUrl,
  inspectStoredObject,
  STORAGE_BUCKETS,
} from "@/lib/storage";
import { NextResponse } from "next/server";

type UploadRequest = {
  conversationId: string;
  fileName: string;
  mimeType: string;
  size: number;
  checksumSha256: string;
};

type CompleteUploadRequest = {
  attachmentId: string;
  conversationId: string;
  objectKey: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readUploadRequest(value: unknown): UploadRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const body = value as Record<string, unknown>;
  if (
    typeof body.conversationId !== "string" ||
    !UUID_PATTERN.test(body.conversationId) ||
    typeof body.fileName !== "string" ||
    body.fileName.trim().length === 0 ||
    body.fileName.length > 255 ||
    typeof body.mimeType !== "string" ||
    body.mimeType.length > 128 ||
    typeof body.size !== "number" ||
    !Number.isSafeInteger(body.size) ||
    typeof body.checksumSha256 !== "string" ||
    !/^[A-Za-z0-9+/]{43}=$/.test(body.checksumSha256)
  ) {
    return null;
  }

  return {
    conversationId: body.conversationId,
    fileName: body.fileName,
    mimeType: body.mimeType,
    size: body.size,
    checksumSha256: body.checksumSha256,
  };
}

function readCompleteUploadRequest(
  value: unknown,
): CompleteUploadRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const body = value as Record<string, unknown>;
  if (
    typeof body.attachmentId !== "string" ||
    !UUID_PATTERN.test(body.attachmentId) ||
    typeof body.conversationId !== "string" ||
    !UUID_PATTERN.test(body.conversationId) ||
    typeof body.objectKey !== "string" ||
    body.objectKey.length > 1_024
  ) {
    return null;
  }

  return {
    attachmentId: body.attachmentId,
    conversationId: body.conversationId,
    objectKey: body.objectKey,
  };
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const message =
    error instanceof Error ? error.message : "Invalid upload request";
  if (
    message.includes("MIME type") ||
    message.includes("byte limit") ||
    message.includes("checksum") ||
    message.includes("object key") ||
    message.includes("storage scope")
  ) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.error("[attachments] Failed to create signed upload URL", message);
  return NextResponse.json(
    { error: "Storage is temporarily unavailable" },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user.profileId) {
      return NextResponse.json(
        { error: "Profile is required" },
        { status: 403 },
      );
    }

    const input = readUploadRequest(await request.json().catch(() => null));
    if (!input) {
      return NextResponse.json(
        { error: "Invalid upload request" },
        { status: 400 },
      );
    }

    if (!(await canAccessConversation(input.conversationId, user.profileId))) {
      return NextResponse.json(
        { error: "Conversation access denied" },
        { status: 403 },
      );
    }

    const signedUpload = await createSignedUploadUrl({
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      ownerId: user.id,
      scopeId: input.conversationId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      checksumSha256: input.checksumSha256,
    });
    const attachmentId = await createPendingAttachment({
      uploadedBy: user.id,
      storagePath: signedUpload.objectKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      byteSize: input.size,
      checksumSha256: input.checksumSha256,
    });

    return NextResponse.json(
      { ...signedUpload, attachmentId },
      {
        headers: { "cache-control": "private, no-store" },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    if (!user.profileId) {
      return NextResponse.json(
        { error: "Profile is required" },
        { status: 403 },
      );
    }

    const input = readCompleteUploadRequest(
      await request.json().catch(() => null),
    );
    if (!input) {
      return NextResponse.json(
        { error: "Invalid completion request" },
        { status: 400 },
      );
    }
    if (!(await canAccessConversation(input.conversationId, user.profileId))) {
      return NextResponse.json(
        { error: "Conversation access denied" },
        { status: 403 },
      );
    }

    const pending = await findOwnedPendingAttachment(
      input.attachmentId,
      user.id,
    );
    if (!pending || pending.storagePath !== input.objectKey) {
      return NextResponse.json(
        { error: "Pending attachment not found" },
        { status: 404 },
      );
    }
    const objectKey = assertScopedObjectKey(pending.storagePath, {
      ownerId: user.id,
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      scopeId: input.conversationId,
    });
    const object = await inspectStoredObject({
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      objectKey,
    });
    const matchesDeclaration =
      object.size === pending.byteSize &&
      object.mimeType === pending.mimeType.toLowerCase() &&
      object.checksumSha256 === pending.checksumSha256;

    if (!matchesDeclaration) {
      await setPendingAttachmentStatus(
        input.attachmentId,
        user.id,
        "quarantined",
      );
      return NextResponse.json(
        { error: "Uploaded file does not match its declared metadata" },
        { status: 400 },
      );
    }
    if (pending.status === "pending") {
      const updated = await setPendingAttachmentStatus(
        input.attachmentId,
        user.id,
        "ready",
      );
      if (!updated) {
        return NextResponse.json(
          { error: "Upload state changed" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { attachmentId: input.attachmentId, status: "ready" },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
