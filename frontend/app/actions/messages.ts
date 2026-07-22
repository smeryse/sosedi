"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";
import { getRepository } from "@/lib/repositories/server";

type MessageType =
  | "text"
  | "voice"
  | "property_card"
  | "viewing_request"
  | "poll"
  | "expense_split"
  | "ai_bot"
  | "system_notice"
  | "attachment";

function refreshMessages(conversationId?: string): void {
  revalidatePath("/app/messages");
  revalidatePath("/owner/messages");
  if (conversationId) revalidatePath(`/app/messages/${conversationId}`);
}

async function assertConversationMember(conversationId: string, profileId: string): Promise<void> {
  const access = await query(
    `select 1 from conversation_members
      where conversation_id = $1 and profile_id = $2 and archived_at is null`,
    [conversationId, profileId],
  );
  if (!access.rowCount) throw new Error("Нет доступа к диалогу");
}

export async function getConversations() {
  return getRepository().getChatThreads();
}

export async function getConversation(conversationId: string) {
  const user = await requireUser();
  const result = await query(
    `select c.*,
            coalesce(members.items, '[]'::jsonb) as conversation_members,
            mine.last_read_at as current_user_last_read,
            mine.is_pinned
       from conversations c
       join conversation_members mine on mine.conversation_id = c.id
        and mine.profile_id = $2 and mine.archived_at is null
       left join lateral (
         select jsonb_agg(jsonb_build_object(
           'profile_id', cm.profile_id, 'last_read_at', cm.last_read_at, 'is_pinned', cm.is_pinned,
           'profiles', jsonb_build_object('id', p.id, 'display_name', p.display_name, 'avatar_path', p.avatar_path)
         ) order by p.display_name) as items
         from conversation_members cm join profiles p on p.id = cm.profile_id
         where cm.conversation_id = c.id and cm.archived_at is null
       ) members on true
      where c.id = $1`,
    [conversationId, user.id],
  );
  if (!result.rows[0]) throw new Error("Диалог не найден или у вас нет доступа");
  return { ...result.rows[0], messages: await getRepository().getMessages(conversationId) };
}

export async function createDirectConversation(otherProfileId: string) {
  const user = await requireUser();
  if (user.id === otherProfileId) throw new Error("Нельзя создать диалог с самим собой");
  const conversationId = await withTransaction(async (client) => {
    const target = await client.query<{
      id: string;
      message_privacy: "everyone" | "verified" | "none";
      email_verified: boolean;
    }>(
      `select p.id, coalesce(s.message_privacy, 'everyone') as message_privacy,
              (u.email_verified_at is not null) as email_verified
         from profiles p join users u on u.id = p.id
         left join user_settings s on s.user_id = p.id
        where p.id = $1 and p.is_public = true and u.disabled_at is null`,
      [otherProfileId],
    );
    if (!target.rows[0]) throw new Error("Профиль недоступен");
    const blocked = await client.query(
      `select 1 from blocked_users where (blocker_id = $1 and blocked_id = $2) or (blocker_id = $2 and blocked_id = $1)`,
      [user.id, otherProfileId],
    );
    if (blocked.rowCount) throw new Error("Нельзя начать диалог с этим пользователем");
    if (target.rows[0].message_privacy === "none") throw new Error("Пользователь запретил новые сообщения");
    if (target.rows[0].message_privacy === "verified" && !user.emailVerified) {
      throw new Error("Для первого сообщения подтвердите email");
    }

    const existing = await client.query<{ id: string }>(
      `select c.id from conversations c
       join conversation_members me on me.conversation_id = c.id and me.profile_id = $1
       join conversation_members them on them.conversation_id = c.id and them.profile_id = $2
       where c.type = 'direct' and (
         select count(*) from conversation_members all_members
         where all_members.conversation_id = c.id and all_members.archived_at is null
       ) = 2 limit 1`,
      [user.id, otherProfileId],
    );
    if (existing.rows[0]) {
      await client.query(
        `update conversation_members set archived_at = null where conversation_id = $1 and profile_id = $2`,
        [existing.rows[0].id, user.id],
      );
      return existing.rows[0].id;
    }
    const created = await client.query<{ id: string }>(
      `insert into conversations (type, created_by) values ('direct', $1) returning id`,
      [user.id],
    );
    await client.query(
      `insert into conversation_members (conversation_id, profile_id) values ($1, $2), ($1, $3)`,
      [created.rows[0].id, user.id, otherProfileId],
    );
    return created.rows[0].id;
  });
  refreshMessages(conversationId);
  return { conversationId };
}

export async function createGroupConversation(groupId: string) {
  const user = await requireUser();
  const conversationId = await withTransaction(async (client) => {
    const member = await client.query(
      `select 1 from group_members where group_id = $1 and profile_id = $2 and status = 'active'`,
      [groupId, user.id],
    );
    if (!member.rowCount) throw new Error("Нет доступа к группе");
    const existing = await client.query<{ id: string }>(
      `select id from conversations where group_id = $1 and type = 'group' limit 1`,
      [groupId],
    );
    if (existing.rows[0]) {
      await client.query(
        `insert into conversation_members (conversation_id, profile_id)
         values ($1, $2) on conflict (conversation_id, profile_id)
         do update set archived_at = null, joined_at = now()`,
        [existing.rows[0].id, user.id],
      );
      return existing.rows[0].id;
    }
    const created = await client.query<{ id: string }>(
      `insert into conversations (type, group_id, created_by) values ('group', $1, $2) returning id`,
      [groupId, user.id],
    );
    await client.query(
      `insert into conversation_members (conversation_id, profile_id)
       select $1, profile_id from group_members where group_id = $2 and status = 'active'`,
      [created.rows[0].id, groupId],
    );
    await client.query(
      `insert into messages (conversation_id, sender_id, body, system_type)
       values ($1, $2, 'Чат группы создан', 'system_notice')`,
      [created.rows[0].id, user.id],
    );
    return created.rows[0].id;
  });
  refreshMessages(conversationId);
  return { conversationId };
}

export async function sendMessageWithAttachments(input: {
  conversationId: string;
  body: string;
  type?: MessageType;
  replyToId?: string;
  extraData?: Record<string, unknown>;
  attachmentIds?: string[];
  clientGeneratedId?: string;
}) {
  const user = await requireUser();
  const body = input.body.trim();
  const attachmentIds = Array.from(new Set(input.attachmentIds ?? [])).slice(0, 10);
  if (!body && !attachmentIds.length) throw new Error("Сообщение не может быть пустым");
  if (body.length > 10_000) throw new Error("Сообщение слишком длинное");
  const message = await withTransaction(async (client) => {
    const membership = await client.query(
      `select 1 from conversation_members where conversation_id = $1 and profile_id = $2 and archived_at is null`,
      [input.conversationId, user.id],
    );
    if (!membership.rowCount) throw new Error("Нет доступа к диалогу");
    if (input.replyToId) {
      const reply = await client.query(
        `select 1 from messages where id = $1 and conversation_id = $2 and deleted_at is null`,
        [input.replyToId, input.conversationId],
      );
      if (!reply.rowCount) throw new Error("Исходное сообщение не найдено");
    }
    if (attachmentIds.length) {
      const attachments = await client.query<{ id: string }>(
        `select id from message_attachments
          where id = any($1::uuid[]) and uploaded_by = $2 and message_id is null
            and status = 'ready' and created_at > now() - interval '1 hour' for update`,
        [attachmentIds, user.id],
      );
      if (attachments.rowCount !== attachmentIds.length) throw new Error("Одно или несколько вложений недоступны");
    }
    const inserted = await client.query(
      `insert into messages
        (conversation_id, sender_id, body, system_type, reply_to_id, extra_data, client_generated_id)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7)
       on conflict (client_generated_id) do update set client_generated_id = excluded.client_generated_id
       returning *`,
      [
        input.conversationId,
        user.id,
        body,
        input.type ?? (attachmentIds.length ? "attachment" : "text"),
        input.replyToId ?? null,
        JSON.stringify(input.extraData ?? {}),
        input.clientGeneratedId ?? null,
      ],
    );
    if (attachmentIds.length) {
      await client.query(
        `update message_attachments set message_id = $1
          where id = any($2::uuid[]) and uploaded_by = $3 and message_id is null`,
        [inserted.rows[0].id, attachmentIds, user.id],
      );
    }
    await client.query(`update conversations set updated_at = now() where id = $1`, [input.conversationId]);
    await client.query(
      `update conversation_members set last_read_at = now(), last_read_message_id = $3
        where conversation_id = $1 and profile_id = $2`,
      [input.conversationId, user.id, inserted.rows[0].id],
    );
    return inserted.rows[0];
  });
  refreshMessages(input.conversationId);
  return message;
}

export async function uploadMessageAttachment(_input: { conversationId: string; file: File }) {
  throw new Error("Вложения загружаются напрямую в защищённое хранилище через API /api/attachments");
}

export async function markConversationRead(conversationId: string) {
  const user = await requireUser();
  const result = await query(
    `update conversation_members set last_read_at = now(), last_read_message_id = (
       select id from messages where conversation_id = $1 and deleted_at is null order by sent_at desc limit 1
     ) where conversation_id = $1 and profile_id = $2 and archived_at is null`,
    [conversationId, user.id],
  );
  if (!result.rowCount) throw new Error("Нет доступа к диалогу");
  refreshMessages(conversationId);
}

export async function editMessage(messageId: string, newBody: string) {
  const user = await requireUser();
  const body = newBody.trim();
  if (!body || body.length > 10_000) throw new Error("Введите сообщение длиной до 10 000 символов");
  const result = await withTransaction(async (client) => {
    const current = await client.query<{ body: string; conversation_id: string }>(
      `select body, conversation_id from messages
        where id = $1 and sender_id = $2 and deleted_at is null
          and sent_at > now() - interval '24 hours' for update`,
      [messageId, user.id],
    );
    if (!current.rows[0]) throw new Error("Сообщение нельзя отредактировать");
    await client.query(
      `insert into message_edits (message_id, previous_body, edited_by) values ($1, $2, $3)`,
      [messageId, current.rows[0].body, user.id],
    );
    await client.query(`update messages set body = $2, edited_at = now() where id = $1`, [messageId, body]);
    return current.rows[0].conversation_id;
  });
  refreshMessages(result);
}

export async function deleteMessage(messageId: string) {
  const user = await requireUser();
  const result = await query<{ conversation_id: string }>(
    `update messages set body = '', deleted_at = now()
      where id = $1 and sender_id = $2 and deleted_at is null returning conversation_id`,
    [messageId, user.id],
  );
  if (!result.rows[0]) throw new Error("Сообщение не найдено");
  refreshMessages(result.rows[0].conversation_id);
}

export async function toggleMessageReaction(messageId: string, emoji: string) {
  const user = await requireUser();
  if (!emoji.trim() || emoji.length > 16) throw new Error("Некорректная реакция");
  const conversationId = await withTransaction(async (client) => {
    const message = await client.query<{ conversation_id: string }>(
      `select m.conversation_id from messages m join conversation_members cm
        on cm.conversation_id = m.conversation_id and cm.profile_id = $2 and cm.archived_at is null
        where m.id = $1 and m.deleted_at is null`,
      [messageId, user.id],
    );
    if (!message.rows[0]) throw new Error("Сообщение не найдено");
    const existing = await client.query(
      `select 1 from message_reactions where message_id = $1 and profile_id = $2 and emoji = $3`,
      [messageId, user.id, emoji],
    );
    if (existing.rowCount) {
      await client.query(
        `delete from message_reactions where message_id = $1 and profile_id = $2 and emoji = $3`,
        [messageId, user.id, emoji],
      );
    } else {
      await client.query(
        `insert into message_reactions (message_id, profile_id, emoji) values ($1, $2, $3)`,
        [messageId, user.id, emoji],
      );
    }
    return message.rows[0].conversation_id;
  });
  refreshMessages(conversationId);
}

export async function pinConversation(conversationId: string) {
  const user = await requireUser();
  await assertConversationMember(conversationId, user.id);
  await query(
    `update conversation_members set is_pinned = not is_pinned
      where conversation_id = $1 and profile_id = $2`,
    [conversationId, user.id],
  );
  refreshMessages(conversationId);
}
