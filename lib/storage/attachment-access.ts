import { query, type QueryResultRow } from "@/lib/db";

type ConversationAccessRow = QueryResultRow & {
  allowed: boolean;
};

type AccessibleAttachmentRow = QueryResultRow & {
  id: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string;
  byte_size: number;
  conversation_id: string;
  uploaded_by: string;
};

type PendingAttachmentRow = QueryResultRow & {
  id: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string;
  byte_size: number;
  checksum_sha256: string;
  status: "pending" | "ready" | "quarantined" | "deleted";
};

export type AccessibleAttachment = {
  id: string;
  storagePath: string;
  fileName: string | null;
  mimeType: string;
  byteSize: number;
  conversationId: string;
  ownerId: string;
};

export type PendingAttachment = {
  id: string;
  storagePath: string;
  fileName: string | null;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
  status: PendingAttachmentRow["status"];
};

export async function canAccessConversation(
  conversationId: string,
  profileId: string,
): Promise<boolean> {
  const result = await query<ConversationAccessRow>(
    `SELECT EXISTS (
       SELECT 1
       FROM conversation_members
       WHERE conversation_id = $1
         AND profile_id = $2
     ) AS allowed`,
    [conversationId, profileId],
  );

  return result.rows[0]?.allowed === true;
}

export async function findAccessibleAttachment(
  attachmentId: string,
  profileId: string,
): Promise<AccessibleAttachment | null> {
  const result = await query<AccessibleAttachmentRow>(
    `SELECT
       a.id,
       a.storage_path,
       a.file_name,
       a.mime_type,
       a.byte_size,
       a.uploaded_by,
       m.conversation_id
     FROM message_attachments a
     JOIN messages m ON m.id = a.message_id
     JOIN conversation_members cm
       ON cm.conversation_id = m.conversation_id
      AND cm.profile_id = $2
     WHERE a.id = $1
       AND a.status = 'ready'
     LIMIT 1`,
    [attachmentId, profileId],
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    conversationId: row.conversation_id,
    ownerId: row.uploaded_by,
  };
}

export async function createPendingAttachment(input: {
  uploadedBy: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
}): Promise<string> {
  const result = await query<{ id: string } & QueryResultRow>(
    `INSERT INTO message_attachments (
       message_id,
       uploaded_by,
       storage_path,
       file_name,
       mime_type,
       byte_size,
       checksum_sha256,
       status
     )
     VALUES (NULL, $1, $2, $3, $4, $5, $6, 'pending')
     RETURNING id`,
    [
      input.uploadedBy,
      input.storagePath,
      input.fileName,
      input.mimeType,
      input.byteSize,
      input.checksumSha256,
    ],
  );
  const attachment = result.rows[0];
  if (!attachment) throw new Error("Failed to create pending attachment");
  return attachment.id;
}

export async function findOwnedPendingAttachment(
  attachmentId: string,
  uploadedBy: string,
): Promise<PendingAttachment | null> {
  const result = await query<PendingAttachmentRow>(
    `SELECT id, storage_path, file_name, mime_type, byte_size, checksum_sha256, status
     FROM message_attachments
     WHERE id = $1
       AND uploaded_by = $2
       AND message_id IS NULL
       AND status IN ('pending', 'ready')
     LIMIT 1`,
    [attachmentId, uploadedBy],
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    checksumSha256: row.checksum_sha256,
    status: row.status,
  };
}

export async function setPendingAttachmentStatus(
  attachmentId: string,
  uploadedBy: string,
  status: "ready" | "quarantined",
): Promise<boolean> {
  const result = await query(
    `UPDATE message_attachments
     SET status = $3
     WHERE id = $1
       AND uploaded_by = $2
       AND message_id IS NULL
       AND status = 'pending'`,
    [attachmentId, uploadedBy, status],
  );

  return result.rowCount === 1;
}
