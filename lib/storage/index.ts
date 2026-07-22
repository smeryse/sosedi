import { randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  PROPERTY_IMAGES: "property-images",
  MESSAGE_ATTACHMENTS: "message-attachments",
  DOCUMENTS: "documents",
  CONTRACTS: "contracts",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const DEFAULT_UPLOAD_TTL_SECONDS = 5 * 60;
const MAX_UPLOAD_TTL_SECONDS = 10 * 60;
const DEFAULT_DOWNLOAD_TTL_SECONDS = 10 * 60;
const MAX_DOWNLOAD_TTL_SECONDS = 60 * 60;

export const FILE_SIZE_LIMITS: Readonly<Record<StorageBucket, number>> = {
  [STORAGE_BUCKETS.AVATARS]: 5 * 1024 * 1024,
  [STORAGE_BUCKETS.PROPERTY_IMAGES]: 10 * 1024 * 1024,
  [STORAGE_BUCKETS.MESSAGE_ATTACHMENTS]: 10 * 1024 * 1024,
  [STORAGE_BUCKETS.DOCUMENTS]: 20 * 1024 * 1024,
  [STORAGE_BUCKETS.CONTRACTS]: 5 * 1024 * 1024,
};

export const ALLOWED_MIME_TYPES: Readonly<
  Record<StorageBucket, readonly string[]>
> = {
  [STORAGE_BUCKETS.AVATARS]: ["image/jpeg", "image/png", "image/webp"],
  [STORAGE_BUCKETS.PROPERTY_IMAGES]: ["image/jpeg", "image/png", "image/webp"],
  [STORAGE_BUCKETS.MESSAGE_ATTACHMENTS]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  [STORAGE_BUCKETS.DOCUMENTS]: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  [STORAGE_BUCKETS.CONTRACTS]: ["application/pdf"],
};

type SignedUploadInput = {
  bucket: StorageBucket;
  ownerId: string;
  scopeId: string;
  fileName: string;
  mimeType: string;
  size: number;
  checksumSha256: string;
  expiresIn?: number;
};

type SignedDownloadInput = {
  bucket: StorageBucket;
  objectKey: string;
  fileName?: string | null;
  expiresIn?: number;
};

type InspectObjectInput = {
  bucket: StorageBucket;
  objectKey: string;
};

type StorageConfiguration = {
  client: S3Client;
  buckets: Record<StorageBucket, string>;
};

let cachedConfiguration: StorageConfiguration | null = null;
let cachedConfigurationKey = "";

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for object storage`);
  return value;
}

function readBucketConfiguration(): Record<StorageBucket, string> {
  return {
    [STORAGE_BUCKETS.AVATARS]: requiredEnvironmentValue("S3_BUCKET_AVATARS"),
    [STORAGE_BUCKETS.PROPERTY_IMAGES]: requiredEnvironmentValue(
      "S3_BUCKET_PROPERTY_IMAGES",
    ),
    [STORAGE_BUCKETS.MESSAGE_ATTACHMENTS]: requiredEnvironmentValue(
      "S3_BUCKET_MESSAGE_ATTACHMENTS",
    ),
    [STORAGE_BUCKETS.DOCUMENTS]: requiredEnvironmentValue(
      "S3_BUCKET_DOCUMENTS",
    ),
    [STORAGE_BUCKETS.CONTRACTS]: requiredEnvironmentValue(
      "S3_BUCKET_CONTRACTS",
    ),
  };
}

function createStorageConfiguration(): StorageConfiguration {
  const region = requiredEnvironmentValue("S3_REGION");
  const endpointValue = process.env.S3_ENDPOINT?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();

  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error(
      "S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be configured together",
    );
  }

  let endpoint: string | undefined;
  if (endpointValue) {
    const parsed = new URL(endpointValue);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("S3_ENDPOINT must use http or https");
    }
    if (parsed.username || parsed.password) {
      throw new Error("S3_ENDPOINT must not contain credentials");
    }
    endpoint = parsed.toString().replace(/\/$/, "");
  }

  const clientConfig: S3ClientConfig = {
    region,
    ...(endpoint ? { endpoint } : {}),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  };

  return {
    client: new S3Client(clientConfig),
    buckets: readBucketConfiguration(),
  };
}

function getStorageConfiguration(): StorageConfiguration {
  const configurationKey = [
    process.env.S3_REGION,
    process.env.S3_ENDPOINT,
    process.env.S3_ACCESS_KEY_ID,
    process.env.S3_SECRET_ACCESS_KEY,
    process.env.S3_FORCE_PATH_STYLE,
    process.env.S3_BUCKET_AVATARS,
    process.env.S3_BUCKET_PROPERTY_IMAGES,
    process.env.S3_BUCKET_MESSAGE_ATTACHMENTS,
    process.env.S3_BUCKET_DOCUMENTS,
    process.env.S3_BUCKET_CONTRACTS,
  ].join("\u0000");

  if (!cachedConfiguration || cachedConfigurationKey !== configurationKey) {
    cachedConfiguration?.client.destroy();
    cachedConfiguration = createStorageConfiguration();
    cachedConfigurationKey = configurationKey;
  }

  return cachedConfiguration;
}

function normalizeIdentifier(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(normalized)) {
    throw new Error(`${fieldName} contains unsupported characters`);
  }
  return normalized;
}

export function normalizeObjectKey(value: string): string {
  const normalized = value.trim().normalize("NFKC");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    normalized.endsWith("/") ||
    normalized.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(normalized) ||
    /(^|\/)\.\.?($|\/)/.test(normalized) ||
    /%2e|%2f|%5c/i.test(normalized)
  ) {
    throw new Error("Invalid object key");
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment.length > 255)) {
    throw new Error("Invalid object key");
  }

  return segments.join("/");
}

function sanitizeFileName(value: string): string {
  const leafName = value.split(/[\\/]/).at(-1)?.trim() ?? "";
  const extensionMatch = leafName.match(/\.([a-zA-Z0-9]{1,10})$/);
  const extension = extensionMatch ? `.${extensionMatch[1].toLowerCase()}` : "";
  const rawBaseName = extension
    ? leafName.slice(0, -extension.length)
    : leafName;
  const baseName = rawBaseName
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 100);

  return `${baseName || "file"}${extension}`;
}

function validateTtl(
  value: number | undefined,
  fallback: number,
  maximum: number,
): number {
  const ttl = value ?? fallback;
  if (!Number.isSafeInteger(ttl) || ttl < 30 || ttl > maximum) {
    throw new Error(`Signed URL TTL must be between 30 and ${maximum} seconds`);
  }
  return ttl;
}

export function validateUpload(
  bucket: StorageBucket,
  mimeType: string,
  size: number,
  checksumSha256?: string,
): void {
  if (
    typeof size !== "number" ||
    !Number.isSafeInteger(size) ||
    size <= 0 ||
    size > FILE_SIZE_LIMITS[bucket]
  ) {
    throw new Error(`File exceeds the ${FILE_SIZE_LIMITS[bucket]} byte limit`);
  }

  if (!ALLOWED_MIME_TYPES[bucket].includes(mimeType)) {
    throw new Error(`MIME type ${mimeType || "(empty)"} is not allowed`);
  }

  if (
    checksumSha256 !== undefined &&
    !/^[A-Za-z0-9+/]{43}=$/.test(checksumSha256)
  ) {
    throw new Error("SHA-256 checksum must use standard base64 encoding");
  }
}

export function createOwnerScopedObjectKey(input: {
  bucket: StorageBucket;
  ownerId: string;
  scopeId: string;
  fileName: string;
}): string {
  const ownerId = normalizeIdentifier(input.ownerId, "ownerId");
  const scopeId = normalizeIdentifier(input.scopeId, "scopeId");
  const fileName = sanitizeFileName(input.fileName);

  return normalizeObjectKey(
    `users/${ownerId}/${input.bucket}/${scopeId}/${randomUUID()}-${fileName}`,
  );
}

export function assertOwnerScopedObjectKey(
  objectKey: string,
  ownerId: string,
): string {
  const normalizedKey = normalizeObjectKey(objectKey);
  const normalizedOwnerId = normalizeIdentifier(ownerId, "ownerId");
  const ownerPrefix = `users/${normalizedOwnerId}/`;

  if (!normalizedKey.startsWith(ownerPrefix)) {
    throw new Error("Object key does not belong to its recorded owner");
  }

  return normalizedKey;
}

export function assertScopedObjectKey(
  objectKey: string,
  scope: { ownerId: string; bucket: StorageBucket; scopeId: string },
): string {
  const normalizedKey = assertOwnerScopedObjectKey(objectKey, scope.ownerId);
  const normalizedOwnerId = normalizeIdentifier(scope.ownerId, "ownerId");
  const normalizedScopeId = normalizeIdentifier(scope.scopeId, "scopeId");
  const expectedPrefix = `users/${normalizedOwnerId}/${scope.bucket}/${normalizedScopeId}/`;

  if (!normalizedKey.startsWith(expectedPrefix)) {
    throw new Error("Object key is outside its recorded storage scope");
  }

  return normalizedKey;
}

export async function createSignedUploadUrl(input: SignedUploadInput): Promise<{
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
  requiredHeaders: Readonly<Record<string, string>>;
}> {
  validateUpload(
    input.bucket,
    input.mimeType,
    input.size,
    input.checksumSha256,
  );

  const objectKey = createOwnerScopedObjectKey(input);
  const expiresIn = validateTtl(
    input.expiresIn,
    DEFAULT_UPLOAD_TTL_SECONDS,
    MAX_UPLOAD_TTL_SECONDS,
  );
  const { client, buckets } = getStorageConfiguration();
  const command = new PutObjectCommand({
    Bucket: buckets[input.bucket],
    Key: objectKey,
    ContentType: input.mimeType,
    ContentLength: input.size,
    ChecksumSHA256: input.checksumSha256,
  });

  return {
    uploadUrl: await getSignedUrl(client, command, {
      expiresIn,
      signableHeaders: new Set(["content-type"]),
      unhoistableHeaders: new Set(["x-amz-checksum-sha256"]),
    }),
    objectKey,
    expiresIn,
    requiredHeaders: {
      "content-type": input.mimeType,
      "x-amz-checksum-sha256": input.checksumSha256,
    },
  };
}

export async function createSignedDownloadUrl(
  input: SignedDownloadInput,
): Promise<{
  downloadUrl: string;
  expiresIn: number;
}> {
  const objectKey = normalizeObjectKey(input.objectKey);
  const expiresIn = validateTtl(
    input.expiresIn,
    DEFAULT_DOWNLOAD_TTL_SECONDS,
    MAX_DOWNLOAD_TTL_SECONDS,
  );
  const { client, buckets } = getStorageConfiguration();
  const fileName = input.fileName ? sanitizeFileName(input.fileName) : null;
  const command = new GetObjectCommand({
    Bucket: buckets[input.bucket],
    Key: objectKey,
    ...(fileName
      ? { ResponseContentDisposition: `attachment; filename="${fileName}"` }
      : {}),
  });

  return {
    downloadUrl: await getSignedUrl(client, command, { expiresIn }),
    expiresIn,
  };
}

export async function inspectStoredObject(input: InspectObjectInput): Promise<{
  size: number;
  mimeType: string;
  checksumSha256: string;
  etag: string | null;
}> {
  const objectKey = normalizeObjectKey(input.objectKey);
  const { client, buckets } = getStorageConfiguration();
  const result = await client.send(
    new HeadObjectCommand({
      Bucket: buckets[input.bucket],
      Key: objectKey,
      ChecksumMode: "ENABLED",
    }),
  );
  const size = result.ContentLength;
  const mimeType = result.ContentType?.split(";", 1)[0]?.trim().toLowerCase();
  const checksumSha256 = result.ChecksumSHA256;

  if (
    typeof size !== "number" ||
    !Number.isSafeInteger(size) ||
    typeof mimeType !== "string" ||
    !mimeType ||
    typeof checksumSha256 !== "string" ||
    !/^[A-Za-z0-9+/]{43}=$/.test(checksumSha256)
  ) {
    throw new Error("Uploaded object metadata is incomplete");
  }

  return {
    size,
    mimeType,
    checksumSha256,
    etag: result.ETag ?? null,
  };
}
