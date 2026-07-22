"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";
import { GroupCreateSchema } from "@/lib/validators/schemas";

type GroupStatus =
  | "forming"
  | "ready"
  | "application_sent"
  | "under_review"
  | "needs_response"
  | "approved"
  | "rejected"
  | "settled";

function refreshGroup(groupId?: string): void {
  revalidatePath("/app/group");
  revalidatePath("/app");
  if (groupId) revalidatePath(`/app/group/${groupId}`);
}

async function requireGroupAdmin(groupId: string, profileId: string): Promise<void> {
  const result = await query(
    `select 1 from group_members
      where group_id = $1 and profile_id = $2 and role = 'admin' and status = 'active'`,
    [groupId, profileId],
  );
  if (!result.rowCount) throw new Error("Это действие доступно только администратору группы");
}

export async function createGroup(input: {
  name: string;
  targetBudget: number;
  moveInDate: string;
  leaseMonths?: number;
}) {
  const user = await requireUser();
  const parsed = GroupCreateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте данные группы");
  const leaseMonths = Math.min(120, Math.max(1, input.leaseMonths ?? 12));
  const group = await withTransaction(async (client) => {
    const result = await client.query(
      `insert into groups (created_by, name, target_budget, move_in_date, lease_months, status)
       values ($1, $2, $3, $4, $5, 'forming') returning *`,
      [user.id, parsed.data.name.trim(), parsed.data.targetBudget, parsed.data.moveInDate, leaseMonths],
    );
    await client.query(
      `insert into group_members (group_id, profile_id, role, status) values ($1, $2, 'admin', 'active')`,
      [result.rows[0].id, user.id],
    );
    await client.query(
      `insert into audit_logs (user_id, action, entity_type, entity_id, metadata)
       values ($1, 'group.created', 'group', $2, '{}'::jsonb)`,
      [user.id, result.rows[0].id],
    );
    return result.rows[0];
  });
  refreshGroup(group.id);
  return group;
}

export async function getUserGroups() {
  const user = await requireUser();
  const result = await query(
    `select g.*,
            coalesce(members.items, '[]'::jsonb) as group_members,
            coalesce(applications.items, '[]'::jsonb) as applications
       from groups g
       join group_members mine on mine.group_id = g.id and mine.profile_id = $1 and mine.status = 'active'
       left join lateral (
         select jsonb_agg(jsonb_build_object(
           'profile_id', gm.profile_id, 'role', gm.role, 'status', gm.status, 'joined_at', gm.joined_at,
           'profiles', jsonb_build_object('id', p.id, 'display_name', p.display_name, 'avatar_path', p.avatar_path,
             'age', p.age, 'job_title', p.job_title)
         ) order by gm.joined_at) as items
         from group_members gm join profiles p on p.id = gm.profile_id
         where gm.group_id = g.id and gm.status = 'active'
       ) members on true
       left join lateral (
         select jsonb_agg(jsonb_build_object(
           'id', a.id, 'status', a.status, 'property_id', a.property_id,
           'properties', jsonb_build_object('title', pr.title, 'district', pr.district, 'monthly_rent', pr.monthly_rent)
         ) order by a.created_at desc) as items
         from applications a join properties pr on pr.id = a.property_id where a.group_id = g.id
       ) applications on true
      where g.archived_at is null order by g.updated_at desc`,
    [user.id],
  );
  return result.rows;
}

export async function getGroup(groupId: string) {
  const user = await requireUser();
  const result = await query(
    `select g.*,
            coalesce(members.items, '[]'::jsonb) as group_members,
            coalesce(applications.items, '[]'::jsonb) as applications,
            mine.role as current_user_role
       from groups g
       join group_members mine on mine.group_id = g.id and mine.profile_id = $2 and mine.status = 'active'
       left join lateral (
         select jsonb_agg(jsonb_build_object(
           'profile_id', gm.profile_id, 'role', gm.role, 'status', gm.status, 'joined_at', gm.joined_at,
           'profiles', jsonb_build_object('id', p.id, 'display_name', p.display_name, 'avatar_path', p.avatar_path,
             'age', p.age, 'job_title', p.job_title, 'budget_min', p.budget_min, 'budget_max', p.budget_max, 'city', p.city)
         ) order by case when gm.role = 'admin' then 0 else 1 end, gm.joined_at) as items
         from group_members gm join profiles p on p.id = gm.profile_id
         where gm.group_id = g.id and gm.status = 'active'
       ) members on true
       left join lateral (
         select jsonb_agg(jsonb_build_object(
           'id', a.id, 'status', a.status, 'total_budget', a.total_budget, 'move_in_date', a.move_in_date,
           'property_id', a.property_id, 'properties', jsonb_build_object('title', pr.title,
             'district', pr.district, 'monthly_rent', pr.monthly_rent, 'area', pr.area, 'rooms', pr.rooms)
         ) order by a.created_at desc) as items
         from applications a join properties pr on pr.id = a.property_id where a.group_id = g.id
       ) applications on true
      where g.id = $1 and g.archived_at is null`,
    [groupId, user.id],
  );
  if (!result.rows[0]) throw new Error("Группа не найдена или у вас нет доступа");
  return result.rows[0];
}

export async function inviteToGroup(groupId: string, inviteeId: string) {
  const user = await requireUser();
  await requireGroupAdmin(groupId, user.id);
  if (inviteeId === user.id) throw new Error("Вы уже состоите в группе");
  const invitee = await query(`select 1 from profiles where id = $1 and is_public = true`, [inviteeId]);
  if (!invitee.rowCount) throw new Error("Профиль не найден");
  const active = await query(
    `select 1 from group_members where group_id = $1 and profile_id = $2 and status = 'active'`,
    [groupId, inviteeId],
  );
  if (active.rowCount) throw new Error("Пользователь уже состоит в группе");

  const tokenHash = createHash("sha256").update(randomBytes(32)).digest("hex");

  const result = await query(
    `insert into group_invitations (group_id, inviter_id, invitee_id, token_hash, status, expires_at)
     values ($1, $2, $3, $4, 'pending', now() + interval '7 days')
     on conflict (group_id, invitee_id) where status = 'pending'
     do update set inviter_id = excluded.inviter_id, token_hash = excluded.token_hash,
       expires_at = excluded.expires_at, updated_at = now()
     returning *`,
    [groupId, user.id, inviteeId, tokenHash],
  );
  await query(
    `insert into notifications (user_id, type, actor_id, entity_type, entity_id, title, body, action_url)
     values ($1, 'group_invite', $2, 'group_invitation', $3, 'Приглашение в группу',
       'Вас пригласили искать жильё вместе', '/app/group')`,
    [inviteeId, user.id, result.rows[0].id],
  );
  refreshGroup(groupId);
  return result.rows[0];
}

export async function acceptGroupInvite(inviteId: string) {
  const user = await requireUser();
  const groupId = await withTransaction(async (client) => {
    const result = await client.query<{ group_id: string }>(
      `select group_id from group_invitations
        where id = $1 and invitee_id = $2 and status = 'pending' and expires_at > now()
        for update`,
      [inviteId, user.id],
    );
    if (!result.rows[0]) throw new Error("Приглашение не найдено или срок действия истёк");
    const count = await client.query<{ count: number }>(
      `select count(*)::int as count from group_members where group_id = $1 and status = 'active'`,
      [result.rows[0].group_id],
    );
    if (count.rows[0].count >= 8) throw new Error("В группе уже максимальное число участников");
    await client.query(
      `insert into group_members (group_id, profile_id, role, status)
       values ($1, $2, 'member', 'active')
       on conflict (group_id, profile_id) do update set status = 'active', role = 'member', joined_at = now()`,
      [result.rows[0].group_id, user.id],
    );
    await client.query(
      `update group_invitations set status = 'accepted', responded_at = now(), updated_at = now() where id = $1`,
      [inviteId],
    );
    return result.rows[0].group_id;
  });
  refreshGroup(groupId);
  return { groupId };
}

export async function declineGroupInvite(inviteId: string) {
  const user = await requireUser();
  const result = await query(
    `update group_invitations set status = 'declined', responded_at = now(), updated_at = now()
      where id = $1 and invitee_id = $2 and status = 'pending' returning group_id`,
    [inviteId, user.id],
  );
  if (!result.rows[0]) throw new Error("Приглашение не найдено");
  refreshGroup(result.rows[0].group_id);
}

export async function leaveGroup(groupId: string) {
  const user = await requireUser();
  await withTransaction(async (client) => {
    const membership = await client.query<{ role: "admin" | "member" }>(
      `select role from group_members where group_id = $1 and profile_id = $2 and status = 'active' for update`,
      [groupId, user.id],
    );
    if (!membership.rows[0]) throw new Error("Вы не состоите в этой группе");
    if (membership.rows[0].role === "admin") {
      const successor = await client.query<{ profile_id: string }>(
        `select profile_id from group_members
          where group_id = $1 and profile_id <> $2 and status = 'active'
          order by joined_at asc limit 1 for update`,
        [groupId, user.id],
      );
      if (successor.rows[0]) {
        await client.query(
          `update group_members set role = 'admin' where group_id = $1 and profile_id = $2`,
          [groupId, successor.rows[0].profile_id],
        );
        await client.query(`update groups set created_by = $2, updated_at = now() where id = $1`, [groupId, successor.rows[0].profile_id]);
      } else {
        await client.query(`update groups set archived_at = now(), updated_at = now() where id = $1`, [groupId]);
      }
    }
    await client.query(
      `update group_members set status = 'left' where group_id = $1 and profile_id = $2`,
      [groupId, user.id],
    );
  });
  refreshGroup(groupId);
  redirect("/app/group");
}

export async function removeGroupMember(groupId: string, memberId: string) {
  const user = await requireUser();
  await requireGroupAdmin(groupId, user.id);
  if (memberId === user.id) throw new Error("Чтобы выйти, передайте роль администратора или используйте выход из группы");
  const result = await query(
    `update group_members set status = 'removed'
      where group_id = $1 and profile_id = $2 and role <> 'admin' and status = 'active'`,
    [groupId, memberId],
  );
  if (!result.rowCount) throw new Error("Участник не найден");
  refreshGroup(groupId);
}

export async function updateGroup(groupId: string, updates: {
  name?: string;
  target_budget?: number;
  move_in_date?: string;
  lease_months?: number;
  status?: GroupStatus;
}) {
  const user = await requireUser();
  await requireGroupAdmin(groupId, user.id);
  const allowedStatuses: GroupStatus[] = ["forming", "ready"];
  if (updates.status && !allowedStatuses.includes(updates.status)) {
    throw new Error("Этот статус меняется автоматически по ходу аренды");
  }
  const values: unknown[] = [groupId];
  const sets: string[] = [];
  const fields = ["name", "target_budget", "move_in_date", "lease_months", "status"] as const;
  for (const field of fields) {
    if (updates[field] !== undefined) {
      values.push(updates[field]);
      sets.push(`${field} = $${values.length}`);
    }
  }
  if (!sets.length) return getGroup(groupId);
  if (updates.name !== undefined && (updates.name.trim().length < 2 || updates.name.length > 100)) {
    throw new Error("Название должно содержать от 2 до 100 символов");
  }
  if (updates.target_budget !== undefined && updates.target_budget <= 0) throw new Error("Бюджет должен быть больше нуля");
  if (updates.lease_months !== undefined && (updates.lease_months < 1 || updates.lease_months > 120)) {
    throw new Error("Срок аренды должен быть от 1 до 120 месяцев");
  }
  await query(`update groups set ${sets.join(", ")}, updated_at = now() where id = $1`, values);
  refreshGroup(groupId);
  return getGroup(groupId);
}

export async function deleteGroup(groupId: string) {
  const user = await requireUser();
  await requireGroupAdmin(groupId, user.id);
  const active = await query(
    `select 1 from applications where group_id = $1 and status not in ('rejected', 'withdrawn', 'settled') limit 1`,
    [groupId],
  );
  if (active.rowCount) throw new Error("Нельзя удалить группу с активной заявкой");
  await query(`update groups set archived_at = now(), updated_at = now() where id = $1`, [groupId]);
  refreshGroup(groupId);
  redirect("/app/group");
}
