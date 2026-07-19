"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: members, error } = await supabase
    .from("conversation_members")
    .select(`
      conversation_id,
      last_read_at,
      is_pinned,
      conversations (
        id,
        type,
        group_id,
        property_id,
        application_id,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq("profile_id", user.id);

  if (error || !members) return [];

  const conversationIds = members.map((m) => m.conversations?.id).filter(Boolean) as string[];
  if (!conversationIds.length) return [];

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_members!inner (
        profile_id,
        last_read_at,
        is_pinned,
        profiles (id, display_name, avatar_path)
      ),
      messages (
        id,
        sender_id,
        body,
        system_type,
        reply_to_id,
        extra_data,
        sent_at,
        edited_at,
        deleted_at
      )
    `)
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  return conversations || [];
}

export async function getConversation(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Check membership
  const { data: member } = await supabase
    .from("conversation_members")
    .select("last_read_at, is_pinned")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!member) throw new Error("Нет доступа к диалогу");

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_members (
        profile_id,
        last_read_at,
        is_pinned,
        profiles (id, display_name, avatar_path)
      ),
      messages (
        id,
        sender_id,
        body,
        system_type,
        reply_to_id,
        extra_data,
        sent_at,
        edited_at,
        deleted_at,
        message_attachments (id, storage_path, mime_type, byte_size)
      )
    `)
    .eq("id", conversationId)
    .single();

  if (error || !data) throw new Error("Диалог не найден");

  // Fetch reactions for conversation messages
  const messageIds = data.messages.map((m: any) => m.id);
  let reactions: any[] = [];
  if (messageIds.length > 0) {
    const { data: rxData } = await supabase
      .from("message_reactions")
      .select("message_id, profile_id, emoji")
      .in("message_id", messageIds);
    reactions = rxData || [];
  }

  return {
    ...data,
    currentUserLastRead: member.last_read_at,
    isPinned: member.is_pinned,
    reactions,
  };
}

export async function createDirectConversation(otherProfileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  if (user.id === otherProfileId) throw new Error("Нельзя создать диалог с самим собой");

  // Idempotent Check: Check if direct conversation between these 2 users already exists
  const { data: existingMembers } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("profile_id", user.id);

  if (existingMembers && existingMembers.length > 0) {
    const myConvIds = existingMembers.map((m) => m.conversation_id);

    const { data: commonMember } = await supabase
      .from("conversation_members")
      .select("conversation_id, conversations!inner(type)")
      .eq("profile_id", otherProfileId)
      .eq("conversations.type", "direct")
      .in("conversation_id", myConvIds)
      .limit(1)
      .maybeSingle();

    if (commonMember) {
      redirect(`/app/messages/${commonMember.conversation_id}`);
    }
  }

  // Create new direct conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      type: "direct",
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !conversation) throw new Error("Не удалось создать диалог");

  await supabase.from("conversation_members").insert([
    { conversation_id: conversation.id, profile_id: user.id, joined_at: new Date().toISOString() },
    { conversation_id: conversation.id, profile_id: otherProfileId, joined_at: new Date().toISOString() },
  ]);

  // System notice message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    body: "Диалог создан",
    system_type: "system_notice",
    sent_at: new Date().toISOString(),
  });

  revalidatePath("/app/messages");
  redirect(`/app/messages/${conversation.id}`);
}

export async function createGroupConversation(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Idempotent Check: Existing group conversation for this group_id
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("id")
    .eq("group_id", groupId)
    .eq("type", "group")
    .maybeSingle();

  if (existingConv) {
    redirect(`/app/messages/${existingConv.id}`);
  }

  // Verify user is member or admin of group
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", user.id)
    .single();

  if (!membership) throw new Error("Нет доступа к группе");

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      type: "group",
      group_id: groupId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !conversation) throw new Error("Не удалось создать чат группы");

  // Add active members
  const { data: members } = await supabase
    .from("group_members")
    .select("profile_id")
    .eq("group_id", groupId)
    .eq("status", "active");

  if (members && members.length > 0) {
    await supabase.from("conversation_members").insert(
      members.map((m) => ({
        conversation_id: conversation.id,
        profile_id: m.profile_id,
        joined_at: new Date().toISOString(),
      }))
    );
  }

  revalidatePath("/app/messages");
  revalidatePath(`/app/group/${groupId}`);
  redirect(`/app/messages/${conversation.id}`);
}

export async function sendMessageWithAttachments(input: {
  conversationId: string;
  body: string;
  type?: "text" | "voice" | "property_card" | "viewing_request" | "poll" | "expense_split" | "ai_bot" | "system_notice" | "attachment";
  replyToId?: string;
  extraData?: any;
  attachmentIds?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Check membership
  const { data: member } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", input.conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!member) throw new Error("Нет доступа к диалогу");

  // Create message atomically
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: user.id,
      body: input.body,
      system_type: input.type !== "text" ? input.type : null,
      reply_to_id: input.replyToId || null,
      extra_data: input.extraData || {},
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !message) {
    // If message creation fails, clean up attachments
    if (input.attachmentIds?.length) {
      await supabase.from("message_attachments").delete().in("id", input.attachmentIds);
    }
    throw new Error("Не удалось отправить сообщение");
  }

  // Link pre-uploaded attachments
  if (input.attachmentIds?.length) {
    await supabase
      .from("message_attachments")
      .update({ message_id: message.id })
      .in("id", input.attachmentIds);
  }

  // Touch conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.conversationId);

  // Update sender last_read_at
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", input.conversationId)
    .eq("profile_id", user.id);

  revalidatePath(`/app/messages/${input.conversationId}`);
  return message;
}

export async function uploadMessageAttachment(input: {
  conversationId: string;
  file: File;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: member } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", input.conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!member) throw new Error("Нет доступа к диалогу");

  const MAX_SIZE = 25 * 1024 * 1024; // 25MB limit
  if (input.file.size > MAX_SIZE) throw new Error("Файл слишком большой (макс. 25 МБ)");

  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (!allowedTypes.includes(input.file.type)) throw new Error("Неподдерживаемый тип файла");

  const ext = input.file.name.split(".").pop() || "file";
  const storagePath = `${input.conversationId}/${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("message-attachments")
    .upload(storagePath, input.file, { contentType: input.file.type, upsert: false });

  if (uploadError) throw new Error(`Ошибка загрузки: ${uploadError.message}`);

  const { data: attachment, error: attachError } = await supabase
    .from("message_attachments")
    .insert({
      message_id: "", // Will be linked in sendMessageWithAttachments
      storage_path: storagePath,
      mime_type: input.file.type,
      byte_size: input.file.size,
    })
    .select()
    .single();

  if (attachError || !attachment) {
    await supabase.storage.from("message-attachments").remove([storagePath]);
    throw new Error("Не удалось сохранить вложение");
  }

  return { attachment, storagePath };
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id);

  revalidatePath("/app/messages");
  revalidatePath(`/app/messages/${conversationId}`);
}

export async function editMessage(messageId: string, newBody: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const trimmed = newBody.trim();
  if (!trimmed) throw new Error("Сообщение не может быть пустым");

  const { error } = await supabase
    .from("messages")
    .update({
      body: trimmed,
      edited_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .eq("sender_id", user.id);

  if (error) throw new Error("Не удалось отредактировать сообщение");
  revalidatePath("/app/messages");
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("messages")
    .update({
      body: "Сообщение удалено",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .eq("sender_id", user.id);

  if (error) throw new Error("Не удалось удалить сообщение");
  revalidatePath("/app/messages");
}

export async function toggleMessageReaction(messageId: string, emoji: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Check existing reaction
  const { data: existing } = await supabase
    .from("message_reactions")
    .select("*")
    .eq("message_id", messageId)
    .eq("profile_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("profile_id", user.id)
      .eq("emoji", emoji);
  } else {
    await supabase.from("message_reactions").insert({
      message_id: messageId,
      profile_id: user.id,
      emoji,
    });
  }

  revalidatePath("/app/messages");
}

export async function pinConversation(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: member } = await supabase
    .from("conversation_members")
    .select("is_pinned")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!member) throw new Error("Нет доступа к диалогу");

  await supabase
    .from("conversation_members")
    .update({ is_pinned: !member.is_pinned })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id);

  revalidatePath("/app/messages");
}