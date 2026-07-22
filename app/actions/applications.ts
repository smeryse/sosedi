"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "reviewing"
  | "needs_response"
  | "approved"
  | "rejected"
  | "contract_agreed"
  | "settled"
  | "withdrawn";

function refreshApplication(applicationId?: string): void {
  revalidatePath("/app/applications");
  revalidatePath("/owner/applications");
  revalidatePath("/app/group");
  revalidatePath("/owner");
  if (applicationId) {
    revalidatePath(`/app/applications/${applicationId}`);
    revalidatePath(`/owner/applications/${applicationId}`);
  }
}

export async function getApplication(applicationId: string) {
  const user = await requireUser();
  const result = await query(
    `select a.*,
            jsonb_build_object('id', g.id, 'name', g.name, 'target_budget', g.target_budget,
              'move_in_date', g.move_in_date, 'status', g.status) as groups,
            jsonb_build_object('id', p.id, 'title', p.title, 'district', p.district,
              'monthly_rent', p.monthly_rent, 'address', p.address, 'area', p.area,
              'rooms', p.rooms, 'owner_id', p.owner_id) as properties,
            coalesce(members.items, '[]'::jsonb) as application_members,
            coalesce(events.items, '[]'::jsonb) as application_events,
            case when p.owner_id = $2 then 'owner'
                 when a.created_by = $2 then 'creator'
                 else 'member' end as viewer_role
       from applications a
       join groups g on g.id = a.group_id
       join properties p on p.id = a.property_id
       left join lateral (
         select jsonb_agg(jsonb_build_object(
           'profile_id', am.profile_id, 'rent_share', am.rent_share, 'confirmed_at', am.confirmed_at,
           'profiles', jsonb_build_object('id', pr.id, 'display_name', pr.display_name,
             'avatar_path', pr.avatar_path, 'age', pr.age, 'job_title', pr.job_title)
         ) order by pr.display_name) as items
         from application_members am join profiles pr on pr.id = am.profile_id where am.application_id = a.id
       ) members on true
       left join lateral (
         select jsonb_agg(jsonb_build_object(
           'id', ae.id, 'actor_id', ae.actor_id, 'from_status', ae.from_status,
           'to_status', ae.to_status, 'note', ae.note, 'created_at', ae.created_at
         ) order by ae.created_at) as items
         from application_events ae where ae.application_id = a.id
       ) events on true
      where a.id = $1 and (
        p.owner_id = $2 or a.created_by = $2 or exists (
          select 1 from application_members access where access.application_id = a.id and access.profile_id = $2
        )
      )`,
    [applicationId, user.id],
  );
  if (!result.rows[0]) throw new Error("Заявка не найдена или у вас нет доступа");
  return result.rows[0];
}

export async function getUserApplications() {
  const user = await requireUser();
  const result = await query(
    `select a.*,
            jsonb_build_object('id', g.id, 'name', g.name, 'target_budget', g.target_budget,
              'move_in_date', g.move_in_date) as groups,
            jsonb_build_object('id', p.id, 'title', p.title, 'district', p.district,
              'monthly_rent', p.monthly_rent, 'address', p.address, 'area', p.area, 'rooms', p.rooms) as properties,
            coalesce(members.items, '[]'::jsonb) as application_members
       from applications a
       join groups g on g.id = a.group_id
       join properties p on p.id = a.property_id
       left join lateral (
         select jsonb_agg(jsonb_build_object('profile_id', am.profile_id, 'rent_share', am.rent_share,
           'confirmed_at', am.confirmed_at)) as items from application_members am where am.application_id = a.id
       ) members on true
      where a.created_by = $1 or exists (
        select 1 from application_members access where access.application_id = a.id and access.profile_id = $1
      ) order by a.created_at desc`,
    [user.id],
  );
  return result.rows;
}

export async function getOwnerApplications() {
  const user = await requireUser();
  const result = await query(
    `select a.*,
            jsonb_build_object('id', g.id, 'name', g.name, 'target_budget', g.target_budget,
              'move_in_date', g.move_in_date, 'status', g.status) as groups,
            jsonb_build_object('id', p.id, 'title', p.title, 'district', p.district,
              'monthly_rent', p.monthly_rent, 'owner_id', p.owner_id) as properties,
            coalesce(members.items, '[]'::jsonb) as application_members
       from applications a join groups g on g.id = a.group_id join properties p on p.id = a.property_id
       left join lateral (
         select jsonb_agg(jsonb_build_object('profile_id', am.profile_id, 'rent_share', am.rent_share,
           'confirmed_at', am.confirmed_at, 'display_name', pr.display_name, 'avatar_path', pr.avatar_path)
           order by pr.display_name) as items
           from application_members am join profiles pr on pr.id = am.profile_id where am.application_id = a.id
       ) members on true
      where p.owner_id = $1 order by a.created_at desc`,
    [user.id],
  );
  return result.rows;
}

export async function createApplication(input: {
  groupId: string;
  propertyId: string;
  totalBudget: number;
  moveInDate: string;
  leaseMonths: number;
  message?: string;
  memberShares: Array<{ profileId: string; rentShare: number }>;
}) {
  const user = await requireUser();
  if (input.totalBudget <= 0) throw new Error("Укажите общий бюджет");
  if (input.leaseMonths < 1 || input.leaseMonths > 120) throw new Error("Срок аренды должен быть от 1 до 120 месяцев");
  if (input.memberShares.length === 0) throw new Error("В заявке должен быть хотя бы один участник");
  if (input.memberShares.some((member) => member.rentShare < 0)) throw new Error("Доли не могут быть отрицательными");
  if (input.memberShares.reduce((sum, member) => sum + member.rentShare, 0) !== input.totalBudget) {
    throw new Error("Сумма долей участников должна совпадать с общим бюджетом");
  }
  const message = input.message?.trim();
  if (message && (message.length < 10 || message.length > 2_000)) {
    throw new Error("Сообщение должно содержать от 10 до 2 000 символов");
  }

  const application = await withTransaction(async (client) => {
    const group = await client.query<{ target_budget: number }>(
      `select g.target_budget from groups g
       join group_members gm on gm.group_id = g.id
       where g.id = $1 and gm.profile_id = $2 and gm.role = 'admin' and gm.status = 'active'
         and g.archived_at is null for update of g`,
      [input.groupId, user.id],
    );
    if (!group.rows[0]) throw new Error("Отправить заявку может только администратор группы");

    const property = await client.query<{ owner_id: string; monthly_rent: number; title: string }>(
      `select owner_id, monthly_rent, title from properties
        where id = $1 and status = 'published' and is_available = true for update`,
      [input.propertyId],
    );
    if (!property.rows[0]) throw new Error("Объект больше недоступен");

    const members = await client.query<{ profile_id: string }>(
      `select profile_id from group_members where group_id = $1 and status = 'active' order by profile_id`,
      [input.groupId],
    );
    const actual = members.rows.map((row) => row.profile_id).sort();
    const supplied = input.memberShares.map((member) => member.profileId).sort();
    if (actual.length !== supplied.length || actual.some((id, index) => id !== supplied[index])) {
      throw new Error("Состав заявки должен совпадать с текущим составом группы");
    }
    const duplicate = await client.query(
      `select 1 from applications where group_id = $1 and property_id = $2
        and status not in ('rejected', 'withdrawn')`,
      [input.groupId, input.propertyId],
    );
    if (duplicate.rowCount) throw new Error("Активная заявка на этот объект уже существует");

    const result = await client.query(
      `insert into applications
        (group_id, property_id, created_by, status, total_budget, tenant_message, move_in_date, lease_months)
       values ($1, $2, $3, 'submitted', $4, $5, $6, $7) returning *`,
      [input.groupId, input.propertyId, user.id, input.totalBudget, message ?? null, input.moveInDate, input.leaseMonths],
    );
    for (const member of input.memberShares) {
      await client.query(
        `insert into application_members (application_id, profile_id, rent_share) values ($1, $2, $3)`,
        [result.rows[0].id, member.profileId, member.rentShare],
      );
    }
    await client.query(
      `insert into application_events (application_id, actor_id, from_status, to_status, note)
       values ($1, $2, null, 'submitted', 'Заявка отправлена собственнику')`,
      [result.rows[0].id, user.id],
    );
    await client.query(`update groups set status = 'application_sent', updated_at = now() where id = $1`, [input.groupId]);

    const conversation = await client.query<{ id: string }>(
      `insert into conversations (type, group_id, property_id, application_id, created_by)
       values ('owner_group', $1, $2, $3, $4) returning id`,
      [input.groupId, input.propertyId, result.rows[0].id, user.id],
    );
    const participants = Array.from(new Set([...actual, property.rows[0].owner_id]));
    for (const profileId of participants) {
      await client.query(
        `insert into conversation_members (conversation_id, profile_id) values ($1, $2)`,
        [conversation.rows[0].id, profileId],
      );
    }
    await client.query(
      `insert into messages (conversation_id, sender_id, body, system_type, extra_data)
       values ($1, $2, $3, 'system_notice', $4::jsonb)`,
      [conversation.rows[0].id, user.id, `Заявка на «${property.rows[0].title}» отправлена`, JSON.stringify({ applicationId: result.rows[0].id })],
    );
    await client.query(
      `insert into notifications (user_id, type, actor_id, entity_type, entity_id, title, body, action_url)
       values ($1, 'application_created', $2, 'application', $3, 'Новая заявка',
         'Группа хочет арендовать ваш объект', $4)`,
      [property.rows[0].owner_id, user.id, result.rows[0].id, `/owner/applications/${result.rows[0].id}`],
    );
    return result.rows[0];
  });
  refreshApplication(application.id);
  return application;
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  note?: string,
) {
  const user = await requireUser();
  const updated = await withTransaction(async (client) => {
    const result = await client.query<{
      id: string;
      status: ApplicationStatus;
      group_id: string;
      property_id: string;
      created_by: string;
      owner_id: string;
    }>(
      `select a.id, a.status, a.group_id, a.property_id, a.created_by, p.owner_id
       from applications a join properties p on p.id = a.property_id where a.id = $1 for update of a`,
      [applicationId],
    );
    const current = result.rows[0];
    if (!current) throw new Error("Заявка не найдена");

    const ownerTransitions: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
      submitted: ["reviewing", "needs_response", "approved", "rejected"],
      reviewing: ["needs_response", "approved", "rejected"],
      needs_response: ["reviewing", "approved", "rejected"],
      approved: ["rejected"],
      contract_agreed: ["settled", "rejected"],
    };
    const tenantTransitions: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
      submitted: ["withdrawn"],
      reviewing: ["withdrawn"],
      needs_response: ["submitted", "withdrawn"],
      approved: ["withdrawn"],
    };
    const transitions = current.owner_id === user.id
      ? ownerTransitions[current.status]
      : current.created_by === user.id
        ? tenantTransitions[current.status]
        : undefined;
    if (!transitions?.includes(newStatus)) throw new Error("Недопустимый переход статуса");

    const update = await client.query(
      `update applications set status = $2, owner_note = case when $3::text is null then owner_note else $3 end,
        updated_at = now() where id = $1 returning *`,
      [applicationId, newStatus, note?.trim().slice(0, 2_000) || null],
    );
    await client.query(
      `insert into application_events (application_id, actor_id, from_status, to_status, note)
       values ($1, $2, $3, $4, $5)`,
      [applicationId, user.id, current.status, newStatus, note?.trim().slice(0, 2_000) || `Статус: ${newStatus}`],
    );
    if (newStatus === "rejected" || newStatus === "withdrawn") {
      await client.query(`update groups set status = 'ready', updated_at = now() where id = $1`, [current.group_id]);
    } else if (newStatus === "approved") {
      await client.query(`update groups set status = 'approved', updated_at = now() where id = $1`, [current.group_id]);
    } else if (newStatus === "settled") {
      await client.query(`update groups set status = 'settled', updated_at = now() where id = $1`, [current.group_id]);
      await client.query(`update properties set status = 'paused', is_available = false, updated_at = now() where id = $1`, [current.property_id]);
    }
    const recipients = await client.query<{ profile_id: string }>(
      `select profile_id from application_members where application_id = $1 and profile_id <> $2`,
      [applicationId, user.id],
    );
    for (const recipient of recipients.rows) {
      await client.query(
        `insert into notifications (user_id, type, actor_id, entity_type, entity_id, title, body, action_url)
         values ($1, 'application_status', $2, 'application', $3, 'Статус заявки изменён', $4, $5)`,
        [recipient.profile_id, user.id, applicationId, `Новый статус: ${newStatus}`, `/app/applications/${applicationId}`],
      );
    }
    return update.rows[0];
  });
  refreshApplication(applicationId);
  return updated;
}

export async function confirmApplicationMember(applicationId: string, profileId: string) {
  const user = await requireUser();
  if (user.id !== profileId) throw new Error("Можно подтвердить участие только за себя");
  const status = await withTransaction(async (client) => {
    const application = await client.query<{ status: ApplicationStatus }>(
      `select status from applications where id = $1 for update`,
      [applicationId],
    );
    if (application.rows[0]?.status !== "approved") {
      throw new Error("Подтверждение доступно после одобрения собственником");
    }
    const update = await client.query(
      `update application_members set confirmed_at = now()
        where application_id = $1 and profile_id = $2 and confirmed_at is null`,
      [applicationId, user.id],
    );
    if (!update.rowCount) throw new Error("Участник уже подтвердил условия или не найден");
    const pending = await client.query<{ count: number }>(
      `select count(*)::int as count from application_members where application_id = $1 and confirmed_at is null`,
      [applicationId],
    );
    if (pending.rows[0].count === 0) {
      await client.query(`update applications set status = 'contract_agreed', updated_at = now() where id = $1`, [applicationId]);
      await client.query(
        `insert into application_events (application_id, actor_id, from_status, to_status, note)
         values ($1, $2, 'approved', 'contract_agreed', 'Все участники подтвердили условия')`,
        [applicationId, user.id],
      );
      return "contract_agreed";
    }
    return "approved";
  });
  refreshApplication(applicationId);
  return { status };
}

export async function getApplicationEvents(applicationId: string) {
  await getApplication(applicationId);
  const result = await query(
    `select ae.*, jsonb_build_object('id', p.id, 'display_name', p.display_name,
      'avatar_path', p.avatar_path) as actor
     from application_events ae left join profiles p on p.id = ae.actor_id
     where ae.application_id = $1 order by ae.created_at asc`,
    [applicationId],
  );
  return result.rows;
}
