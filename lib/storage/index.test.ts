import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertScopedObjectKey,
  createOwnerScopedObjectKey,
  createSignedUploadUrl,
  normalizeObjectKey,
  STORAGE_BUCKETS,
  validateUpload,
} from "./index";

describe("object storage boundaries", () => {
  const ownerId = "e47f49fd-26f2-4c5e-a07f-f8f87bbdb13c";
  const conversationId = "8ec16f93-b415-4e95-a79f-dff8a21842e1";

  afterEach(() => vi.unstubAllEnvs());

  it("creates an owner and conversation scoped key", () => {
    const key = createOwnerScopedObjectKey({
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      ownerId,
      scopeId: conversationId,
      fileName: "../../договор аренды.pdf",
    });

    expect(key).toMatch(
      new RegExp(
        `^users/${ownerId}/message-attachments/${conversationId}/[0-9a-f-]+-file\\.pdf$`,
      ),
    );
    expect(() =>
      assertScopedObjectKey(key, {
        ownerId,
        bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
        scopeId: conversationId,
      }),
    ).not.toThrow();
  });

  it("rejects traversal and encoded separators", () => {
    expect(() => normalizeObjectKey("users/a/../secret")).toThrow(
      "Invalid object key",
    );
    expect(() => normalizeObjectKey("users/a/%2e%2e/secret")).toThrow(
      "Invalid object key",
    );
    expect(() => normalizeObjectKey("users\\a\\secret")).toThrow(
      "Invalid object key",
    );
  });

  it("rejects a key from another owner or conversation", () => {
    const key = createOwnerScopedObjectKey({
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      ownerId,
      scopeId: conversationId,
      fileName: "photo.jpg",
    });

    expect(() =>
      assertScopedObjectKey(key, {
        ownerId: "f236678d-1788-481f-ab2a-7e3ac3b6f1bf",
        bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
        scopeId: conversationId,
      }),
    ).toThrow();
    expect(() =>
      assertScopedObjectKey(key, {
        ownerId,
        bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
        scopeId: "adf15476-8793-4e65-8b58-7287f8ef49da",
      }),
    ).toThrow();
  });

  it("enforces MIME type, size, and checksum", () => {
    const checksum = `${"A".repeat(43)}=`;
    expect(() =>
      validateUpload(
        STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
        "application/pdf",
        1024,
        checksum,
      ),
    ).not.toThrow();
    expect(() =>
      validateUpload(
        STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
        "text/html",
        1024,
        checksum,
      ),
    ).toThrow("MIME type");
    expect(() =>
      validateUpload(
        STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
        "application/pdf",
        11 * 1024 * 1024,
        checksum,
      ),
    ).toThrow("byte limit");
    expect(() =>
      validateUpload(
        STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
        "application/pdf",
        1024,
        "bad",
      ),
    ).toThrow("checksum");
  });

  it("binds content length, MIME type, and checksum into a short PUT signature", async () => {
    vi.stubEnv("S3_REGION", "us-east-1");
    vi.stubEnv("S3_ENDPOINT", "http://127.0.0.1:9000");
    vi.stubEnv("S3_FORCE_PATH_STYLE", "true");
    vi.stubEnv("S3_ACCESS_KEY_ID", "test-access-key");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "test-secret-key");
    vi.stubEnv("S3_BUCKET_AVATARS", "avatars");
    vi.stubEnv("S3_BUCKET_PROPERTY_IMAGES", "property-images");
    vi.stubEnv("S3_BUCKET_MESSAGE_ATTACHMENTS", "message-attachments");
    vi.stubEnv("S3_BUCKET_DOCUMENTS", "documents");
    vi.stubEnv("S3_BUCKET_CONTRACTS", "contracts");
    const checksum = `${"A".repeat(43)}=`;

    const signed = await createSignedUploadUrl({
      bucket: STORAGE_BUCKETS.MESSAGE_ATTACHMENTS,
      ownerId,
      scopeId: conversationId,
      fileName: "lease.pdf",
      mimeType: "application/pdf",
      size: 1024,
      checksumSha256: checksum,
    });
    const url = new URL(signed.uploadUrl);
    const signedHeaders =
      url.searchParams.get("X-Amz-SignedHeaders")?.split(";") ?? [];

    expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
    expect(signedHeaders).toEqual(
      expect.arrayContaining([
        "content-length",
        "content-type",
        "x-amz-checksum-sha256",
      ]),
    );
    expect(signed.requiredHeaders).toEqual({
      "content-type": "application/pdf",
      "x-amz-checksum-sha256": checksum,
    });
  });
});
