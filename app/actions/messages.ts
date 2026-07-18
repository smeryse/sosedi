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
      conversations (
        id,
        type,
        property_id,
        application_id,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq("profile_id", user.id);

  if (error) return [];

  const conversationIds = members?.map(m => m.conversations.id).filter(Boolean) || [];
  if (!conversationIds.length) return [];

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_members!inner (
        profile_id,
        last_read_at,
        profiles (id, display_name, avatar_path)
      ),
      messages (
        id,
        sender_id,
        body,
        system_type,
        sent_at
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
    .select("last_read_at")
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
        profiles (id, display_name, avatar_path)
      ),
      messages (
        id,
        sender_id,
        body,
        system_type,
        sent_at,
        edited_at,
        deleted_at,
        message_attachments (storage_path, mime_type, byte_size)
      )
    `)
    .eq("id", conversationId)
    .single();

  if (error) throw new Error("Диалог не найден");
  return { ...data, currentUserLastRead: member.last_read_at };
}

export async function createDirectConversation(otherProfileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  if (user.id === otherProfileId) throw new Error("Нельзя создать диалог с самим собой");

  // Check if conversation already exists
  const { data: theirConversations } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("profile_id", otherProfileId);

  if (!theirConversations || !theirConversations.length) {
    // Create new conversation
  } else {
    const theirConversationIds = theirConversations.map(c => c.conversation_id);
    
    const { data: existing } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("profile_id", user.id)
      .in("conversation_id", theirConversationIds)
      .single();

    if (existing) {
      redirect(`/app/messages/${existing.conversation_id}`);
    }
  }

  // Create new conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      type: "direct",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error("Не удалось создать диалог");

  await supabase.from("conversation_members").insert([
    { conversation_id: conversation.id, profile_id: user.id, joined_at: new Date().toISOString() },
    { conversation_id: conversation.id, profile_id: otherProfileId, joined_at: new Date().toISOString() },
  ]);

  // Add system message
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

  // Verify user is admin of group
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", user.id)
    .eq("role", "admin")
    .single();

  if (!membership) throw new Error("Только администратор может создать чат группы");

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      type: "group",
      created_by: user.id,
    } as const)
    .select()
    .single();

  if (error) throw new Error("Не удалось создать чат");

  // Add all group members
  const { data: members } = await supabase
    .from("group_members")
    .select("profile_id")
    .eq("group_id", groupId)
    .eq("status", "active");

  if (members) {
    await supabase.from("conversation_members").insert(
      members.map(m => ({
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

export async function sendMessage(input: {
  conversationId: string;
  body: string;
  type?: "text" | "voice" | "property_card" | "viewing_request" | "poll" | "expense_split";
  extraData?: {
    propertyId?: string;
    viewingData?: any;
    pollData?: any;
    expenseData?: any;
    voiceDuration?: string;
  };
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

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: user.id,
      body: input.body,
      system_type: input.type !== "text" ? input.type : null,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error("Не удалось отправить сообщение");

  // Update conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.conversationId);

  // Update last_read_at for sender
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", input.conversationId)
    .eq("profile_id", user.id);

  revalidatePath(`/app/messages/${input.conversationId}`);
  return message;
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

export async function deleteMessage(messageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("sender_id", user.id);

  if (error) throw new Error("Не удалось удалить сообщение");
  revalidatePath("/app/messages");
}

export async function pinConversation(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: member } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!member) throw new Error("Нет доступа к диалогу");

  // This would need a column in conversation_members or a separate table
  // For now, just revalidate
  revalidatePath("/app/messages");
}