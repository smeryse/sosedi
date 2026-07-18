"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGroup(input: {
  name: string;
  targetBudget: number;
  moveInDate: string;
  leaseMonths?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      created_by: user.id,
      name: input.name,
      target_budget: input.targetBudget,
      move_in_date: input.moveInDate,
      lease_months: input.leaseMonths,
      status: "forming",
    })
    .select()
    .single();

  if (error) throw new Error("Не удалось создать группу");

  // Add creator as admin
  await supabase.from("group_members").insert({
    group_id: group.id,
    profile_id: user.id,
    role: "admin",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  revalidatePath("/app/group");
  redirect(`/app/group/${group.id}`);
}

export async function getUserGroups() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members!inner (
        profile_id,
        role,
        status,
        joined_at,
        profiles (id, display_name, avatar_path, age, job_title)
      ),
      applications (
        id,
        status,
        property_id,
        properties (title, district, monthly_rent)
      )
    `)
    .eq("group_members.profile_id", user.id)
    .eq("group_members.status", "active")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getGroup(groupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members (
        profile_id,
        role,
        status,
        joined_at,
        profiles (id, display_name, avatar_path, age, job_title, budget_min, budget_max, city)
      ),
      applications (
        id,
        status,
        total_budget,
        move_in_date,
        property_id,
        properties (title, district, monthly_rent, area, rooms)
      )
    `)
    .eq("id", groupId)
    .single();

  if (error) throw new Error("Группа не найдена");
  return data;
}

export async function inviteToGroup(groupId: string, inviteeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Check if user is admin
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", user.id)
    .eq("role", "admin")
    .single();

  if (!membership) throw new Error("Только администратор может приглашать");

  const { error } = await supabase.from("group_invites").insert({
    group_id: groupId,
    inviter_id: user.id,
    invitee_id: inviteeId,
  });

  if (error) throw new Error("Не удалось отправить приглашение");
  revalidatePath(`/app/group/${groupId}`);
}

export async function acceptGroupInvite(inviteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: invite, error: inviteError } = await supabase
    .from("group_invites")
    .select("group_id, invitee_id")
    .eq("id", inviteId)
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) throw new Error("Приглашение не найдено");

  // Accept invite
  await supabase.from("group_invites").update({ status: "accepted" }).eq("id", inviteId);

  // Add to group
  const { error } = await supabase.from("group_members").insert({
    group_id: invite.group_id,
    profile_id: user.id,
    role: "member",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  if (error) throw new Error("Не удалось вступить в группу");

  revalidatePath("/app/group");
  redirect(`/app/group`);
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("group_members")
    .update({ status: "left" })
    .eq("group_id", groupId)
    .eq("profile_id", user.id);

  if (error) throw new Error("Не удалось покинуть группу");
  revalidatePath("/app/group");
  redirect("/app/group");
}

export async function removeGroupMember(groupId: string, memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Check admin
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", user.id)
    .eq("role", "admin")
    .single();

  if (!membership) throw new Error("Только администратор может исключать");

  // Prevent removing self
  if (memberId === user.id) throw new Error("Нельзя исключить себя");

  const { error } = await supabase
    .from("group_members")
    .update({ status: "removed" })
    .eq("group_id", groupId)
    .eq("profile_id", memberId);

  if (error) throw new Error("Не удалось исключить участника");
  revalidatePath(`/app/group/${groupId}`);
}

export async function updateGroup(groupId: string, updates: {
  name?: string;
  target_budget?: number;
  move_in_date?: string;
  lease_months?: number;
  status?: "forming" | "ready" | "application_sent" | "under_review" | "needs_response" | "approved" | "rejected" | "settled";
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", user.id)
    .eq("role", "admin")
    .single();

  if (!membership) throw new Error("Только администратор может обновлять группу");

  const updateData: any = { updated_at: new Date().toISOString() };
  if (updates.name) updateData.name = updates.name;
  if (updates.target_budget !== undefined) updateData.target_budget = updates.target_budget;
  if (updates.move_in_date !== undefined) updateData.move_in_date = updates.move_in_date;
  if (updates.lease_months !== undefined) updateData.lease_months = updates.lease_months;
  if (updates.status) updateData.status = updates.status;

  const { error } = await supabase
    .from("groups")
    .update(updateData)
    .eq("id", groupId);

  if (error) throw new Error("Не удалось обновить группу");
  revalidatePath(`/app/group/${groupId}`);
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", user.id)
    .eq("role", "admin")
    .single();

  if (!membership) throw new Error("Только администратор может удалить группу");

  const { error } = await supabase
    .from("groups")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", groupId);

  if (error) throw new Error("Не удалось удалить группу");
  revalidatePath("/app/group");
  redirect("/app/group");
}