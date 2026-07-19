/**
 * Supabase Storage Helpers
 * 
 * Provides type-safe signed URL generation for all storage buckets.
 * Works in both Server Components and Server Actions.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Storage bucket names (must match Supabase bucket configuration)
 */
export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  PROPERTY_IMAGES: "property-images",
  MESSAGE_ATTACHMENTS: "message-attachments",
  DOCUMENTS: "documents",
  CONTRACTS: "contracts",
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * File size limits per bucket (in bytes)
 */
export const FILE_SIZE_LIMITS: Record<StorageBucket, number> = {
  [STORAGE_BUCKETS.AVATARS]: 5 * 1024 * 1024, // 5MB
  [STORAGE_BUCKETS.PROPERTY_IMAGES]: 10 * 1024 * 1024, // 10MB
  [STORAGE_BUCKETS.MESSAGE_ATTACHMENTS]: 10 * 1024 * 1024, // 10MB
  [STORAGE_BUCKETS.DOCUMENTS]: 20 * 1024 * 1024, // 20MB
  [STORAGE_BUCKETS.CONTRACTS]: 5 * 1024 * 1024, // 5MB
};

/**
 * Allowed MIME types per bucket
 */
export const ALLOWED_MIME_TYPES: Record<StorageBucket, string[]> = {
  [STORAGE_BUCKETS.AVATARS]: ["image/jpeg", "image/png", "image/webp", "image/heic"],
  [STORAGE_BUCKETS.PROPERTY_IMAGES]: ["image/jpeg", "image/png", "image/webp"],
  [STORAGE_BUCKETS.MESSAGE_ATTACHMENTS]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
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

/**
 * Generate a signed upload URL for direct browser-to-storage upload
 * 
 * @param bucket - Target storage bucket
 * @param objectPath - Object path in bucket (e.g., "user-id/avatar.jpg")
 * @param expiresIn - Expiration in seconds (default: 60 minutes)
 * @returns Signed upload URL and public URL
 */
export async function getSignedUploadUrl(
  bucket: StorageBucket,
  objectPath: string
): Promise<{ uploadUrl: string; publicUrl: string; path: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath, {
      upsert: true,
    });

  if (error || !data) {
    throw new Error(`Failed to create signed upload URL: ${error?.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(objectPath);

  return {
    uploadUrl: data.signedUrl,
    publicUrl: publicUrlData.publicUrl,
    path: objectPath,
  };
}

/**
 * Generate a signed download URL for private buckets
 * 
 * @param bucket - Target storage bucket
 * @param objectPath - Object path in bucket
 * @param expiresIn - Expiration in seconds (default: 1 hour)
 * @returns Signed download URL
 */
export async function getSignedDownloadUrl(
  bucket: StorageBucket,
  objectPath: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresIn);

  if (error || !data) {
    throw new Error(`Failed to create signed download URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Get public URL for public buckets
 */
export async function getPublicUrl(
  bucket: StorageBucket,
  objectPath: string
): Promise<string> {
  const supabase = await createClient();
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}

/**
 * Upload file directly from server (Server Actions only)
 * 
 * @param bucket - Target storage bucket
 * @param objectPath - Object path in bucket
 * @param file - File/Blob to upload
 * @param options - Upload options
 * @returns Public URL of uploaded file
 */
export async function uploadFile(
  bucket: StorageBucket,
  objectPath: string,
  file: File | Blob,
  options?: {
    upsert?: boolean;
    cacheControl?: string;
    contentType?: string;
  }
): Promise<{ path: string; publicUrl: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, {
      upsert: options?.upsert ?? true,
      cacheControl: options?.cacheControl ?? "3600",
      contentType: options?.contentType,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  objectPath: string
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([objectPath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * List files in a bucket folder
 */
export async function listFiles(
  bucket: StorageBucket,
  folderPath: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: "name" | "updated_at" | "created_at"; order: "asc" | "desc" };
  }
): Promise<Array<{ name: string; id: string | null; updatedAt: string | null; createdAt: string | null; size: number }>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, {
      limit: options?.limit ?? 100,
      offset: options?.offset ?? 0,
      sortBy: options?.sortBy,
    });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return (data ?? []).map((file) => ({
    name: file.name,
    id: file.id,
    updatedAt: file.updated_at,
    createdAt: file.created_at,
    size: typeof file.metadata?.size === "number" ? file.metadata.size : 0,
  }));
}

/**
 * Copy file between buckets or within bucket
 */
export async function copyFile(
  sourceBucket: StorageBucket,
  sourcePath: string,
  destBucket: StorageBucket,
  destPath: string
): Promise<{ path: string; publicUrl: string }> {
  const supabase = await createClient();
  
  // Download from source
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(sourceBucket)
    .download(sourcePath);

  if (downloadError || !fileData) {
    throw new Error(`Download failed: ${downloadError?.message}`);
  }

  // Upload to destination
  return uploadFile(destBucket, destPath, fileData);
}

/**
 * Get file metadata
 */
export async function getFileMetadata(
  bucket: StorageBucket,
  objectPath: string
): Promise<{ size: number; mimetype: string; etag: string; lastModified: string } | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .info(objectPath);

  if (error) {
    if (error.message.includes("not found")) return null;
    throw new Error(`Metadata failed: ${error.message}`);
  }

  return {
    size: data.size ?? 0,
    mimetype: data.contentType ?? "application/octet-stream",
    etag: data.etag ?? "",
    lastModified: data.lastModified ?? data.updatedAt ?? "",
  };
}

/**
 * Generate object path for avatars
 */
export function getAvatarPath(userId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `${userId}/avatar.${ext}`;
}

/**
 * Generate object path for property images
 */
export function getPropertyImagePath(propertyId: string, filename: string, index?: number): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const prefix = index !== undefined ? `${index}-` : "";
  return `${propertyId}/${prefix}${Date.now()}.${ext}`;
}

/**
 * Generate object path for message attachments
 */
export function getMessageAttachmentPath(
  conversationId: string,
  userId: string,
  filename: string
): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "bin";
  return `${conversationId}/${userId}/${Date.now()}.${ext}`;
}

/**
 * Generate object path for documents
 */
export function getDocumentPath(
  subjectType: "profile" | "property",
  subjectId: string,
  documentType: string,
  filename: string
): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "pdf";
  return `${subjectType}/${subjectId}/${documentType}/${Date.now()}.${ext}`;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  bucket: StorageBucket
): { valid: boolean; error?: string } {
  const maxSize = FILE_SIZE_LIMITS[bucket];
  const allowedTypes = ALLOWED_MIME_TYPES[bucket];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${maxSize / 1024 / 1024}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Create storage buckets (run once during setup)
 * 
 * Run this in Supabase SQL editor or via CLI:
 * 
 * INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 * VALUES 
 *   ('avatars', 'avatars', true, 5242880, '{"image/jpeg","image/png","image/webp","image/heic"}'),
 *   ('property-images', 'property-images', true, 10485760, '{"image/jpeg","image/png","image/webp"}'),
 *   ('message-attachments', 'message-attachments', false, 10485760, '{"image/jpeg","image/png","image/webp","image/gif","application/pdf","audio/mpeg","audio/ogg","audio/wav"}'),
 *   ('documents', 'documents', false, 20971520, '{"application/pdf","image/jpeg","image/png","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}'),
 *   ('contracts', 'contracts', false, 5242880, '{"application/pdf"}')
 * ON CONFLICT (id) DO NOTHING;
 */
