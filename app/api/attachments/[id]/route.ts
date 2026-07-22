import { AuthError, requireUser } from "@/lib/auth/session";
import { findAccessibleAttachment } from "@/lib/storage/attachment-access";
import {
  assertScopedObjectKey,
  createSignedDownloadUrl,
  STORAGE_BUCKETS,
} from "@/lib/storage";
import { NextResponse } from "next/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    if (!user.profileId) {
      return NextResponse.json(
        { error: "Profile is required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    const attachment = await findAccessibleAttachment(id, user.profileId);
    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    const objectKey = assertScopedObjectKey(attachment.storagePath, {
      ownerId: attachment.ownerId,
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      scopeId: attachment.conversationId,
    });
    const { downloadUrl } = await createSignedDownloadUrl({
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      objectKey,
      fileName: attachment.fileName,
    });

    const response = NextResponse.redirect(downloadUrl, 302);
    response.headers.set("cache-control", "private, no-store");
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error(
      "[attachments] Failed to create signed download URL",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Storage is temporarily unavailable" },
      { status: 503 },
    );
  }
}
