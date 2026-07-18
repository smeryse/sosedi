"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getApplication(applicationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      groups (id, name, target_budget, move_in_date),
      properties (id, title, district, monthly_rent, address, area, rooms),
      application_members (
        profile_id,
        rent_share,
        confirmed_at,
        profiles (id, display_name, avatar_path, age, job_title)
      ),
      application_events (id, actor_id, from_status, to_status, note, created_at)
    `)
    .eq("id", applicationId)
    .single();

  if (error) throw new Error("Заявка не найдена");
  return data;
}

export async function getUserApplications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      groups (id, name, target_budget, move_in_date),
      properties (id, title, district, monthly_rent, address, area, rooms),
      application_members (profile_id, rent_share, confirmed_at)
    `)
    .or(`created_by.eq.${user.id},application_members.profile_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getOwnerApplications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      groups (id, name, target_budget, move_in_date),
      properties!inner (id, title, district, monthly_rent, owner_id),
      application_members (profile_id, rent_share, confirmed_at)
    `)
    .eq("properties.owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export async function createApplication(input: {
  groupId: string;
  propertyId: string;
  totalBudget: number;
  moveInDate: string;
  leaseMonths: number;
  memberShares: Array<{ profileId: string; rentShare: number }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Verify user is in the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", input.groupId)
    .eq("profile_id", user.id)
    .eq("status", "active")
    .single();

  if (!membership) throw new Error("Вы не участник этой группы");

  // Check group is ready
  const { data: group } = await supabase
    .from("groups")
    .select("status, target_budget")
    .eq("id", input.groupId)
    .single();

  if (!group || group.status !== "ready") {
    throw new Error("Группа должна быть в статусе 'Готова к заявке'");
  }

  // Create application
  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      group_id: input.groupId,
      property_id: input.propertyId,
      created_by: user.id,
      status: "submitted",
      total_budget: input.totalBudget,
      move_in_date: input.moveInDate,
      lease_months: input.leaseMonths,
    })
    .select()
    .single();

  if (error) throw new Error("Не удалось создать заявку");

  // Add members with rent shares
  const { error: membersError } = await supabase
    .from("application_members")
    .insert(
      input.memberShares.map(m => ({
        application_id: application.id,
        profile_id: m.profileId,
        rent_share: m.rentShare,
      }))
    );

  if (membersError) throw new Error("Не удалось добавить участников");

  // Log event
  await supabase.from("application_events").insert({
    application_id: application.id,
    actor_id: user.id,
    to_status: "submitted",
    note: "Заявка отправлена на рассмотрение",
  });

  // Update group status
  await supabase
    .from("groups")
    .update({ status: "application_sent", updated_at: new Date().toISOString() })
    .eq("id", input.groupId);

  revalidatePath("/app/applications");
  revalidatePath("/app/group");
  redirect(`/app/applications/${application.id}`);
}

export async function updateApplicationStatus(applicationId: string, newStatus: "draft" | "submitted" | "reviewing" | "needs_response" | "approved" | "rejected" | "contract_agreed" | "settled", note?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Check permissions
  const { data: app } = await supabase
    .from("applications")
    .select(`
      *,
      groups (created_by),
      properties (owner_id)
    `)
    .eq("id", applicationId)
    .single();

  if (!app) throw new Error("Заявка не найдена");

  const isOwner = app.properties.owner_id === user.id;
  const isGroupCreator = app.groups.created_by === user.id;
  const isApplicant = app.created_by === user.id;

  if (!isOwner && !isGroupCreator && !isApplicant) {
    throw new Error("Нет прав для изменения статуса");
  }

  // Valid transitions
  const validTransitions: Record<string, string[]> = {
    submitted: ["reviewing", "rejected"],
    reviewing: ["needs_response", "approved", "rejected"],
    needs_response: ["approved", "rejected", "submitted"],
    approved: ["contract_agreed", "rejected"],
    contract_agreed: ["settled"],
  };

  const currentStatus = app.status;
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Нельзя перейти из "${currentStatus}" в "${newStatus}"`);
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) throw new Error("Не удалось обновить статус");

  // Log event
  await supabase.from("application_events").insert({
    application_id: applicationId,
    actor_id: user.id,
    from_status: currentStatus,
    to_status: newStatus,
    note: note || `Статус изменен на ${newStatus}`,
  });

  // Update group status
  if (newStatus === "approved") {
    await supabase
      .from("groups")
      .update({ status: "settled", updated_at: new Date().toISOString() })
      .eq("id", app.group_id);
  } else if (newStatus === "rejected") {
    await supabase
      .from("groups")
      .update({ status: "ready", updated_at: new Date().toISOString() })
      .eq("id", app.group_id);
  }

  revalidatePath("/app/applications");
  revalidatePath("/owner/applications");
}

export async function confirmApplicationMember(applicationId: string, profileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Check user is the member confirming
  if (user.id !== profileId) throw new Error("Можно подтвердить только себя");

  const { error } = await supabase
    .from("application_members")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("application_id", applicationId)
    .eq("profile_id", profileId);

  if (error) throw new Error("Не удалось подтвердить участие");

  // Check if all confirmed
  const { data: members } = await supabase
    .from("application_members")
    .select("confirmed_at")
    .eq("application_id", applicationId);

  if (members && members.every(m => m.confirmed_at)) {
    await supabase
      .from("applications")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    await supabase.from("application_events").insert({
      application_id: applicationId,
      actor_id: user.id,
      from_status: "needs_response",
      to_status: "approved",
      note: "Все участники подтвердили участие",
    });
  }

  revalidatePath(`/app/applications/${applicationId}`);
}

export async function getApplicationEvents(applicationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_events")
    .select(`
      *,
      actor:profiles!application_events_actor_id_fkey (id, display_name, avatar_path)
    `)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data || [];
}