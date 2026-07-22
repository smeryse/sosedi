import "server-only";

import type { PoolClient, QueryResultRow } from "pg";
import { compatibilityScore } from "@/lib/compatibility/engine";
import type { CompatibilityProfile } from "@/lib/compatibility/types";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";
import {
  assertScopedObjectKey,
  createSignedDownloadUrl,
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/storage";
import type { DemoProperty, DemoRoommate } from "@/data/demo";
import { BaseRepository } from "./base-repository";
import type {
  ChatMessage,
  ChatMessageType,
  ChatThread,
  DemoAnswer,
  DemoApplication,
  DemoChore,
  DemoGroup,
  DemoState,
  ExpenseShare,
  ExpenseSplit,
  GroupPoll,
  MessageAttachment,
  PropertyFilters,
  Repository,
  ViewingBooking,
} from "./types";

type JsonObject = Record<string, unknown>;

interface ProfileRow extends QueryResultRow {
  id: string;
  display_name: string;
  age: number | null;
  job_title: string | null;
  budget_min: number | null;
  budget_max: number | null;
  city: string | null;
  avatar_path: string | null;
  move_in_date: string | null;
  lease_months: number | null;
  preferences: JsonObject | null;
}

interface PropertyRow extends QueryResultRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  district: string;
  monthly_rent: number;
  deposit: number;
  rooms: number;
  area: number;
  floor: number | null;
  total_floors: number | null;
  available_from: string | null;
  lease_months_min: number;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  furnished: boolean;
  status: DemoProperty["status"];
  source: "user" | "ap-r" | null;
  external_id: string | null;
  source_url: string | null;
  developer_name: string | null;
  complex_name: string | null;
  completion_date: string | null;
  finishing_type: string | null;
  image_path: string | null;
  photos_count: number;
  amenities: string[] | null;
  rules: JsonObject | null;
}

interface GroupRow extends QueryResultRow {
  id: string;
  name: string;
  status: DemoGroup["status"];
  target_budget: number;
  move_in_date: string;
  member_ids: string[] | null;
  members: Array<{ id: string; name: string }> | null;
}

interface ApplicationRow extends QueryResultRow {
  id: string;
  property_id: string;
  group_id: string;
  tenant_message: string | null;
  status: DemoApplication["status"];
  created_at: string;
}

interface ThreadRow extends QueryResultRow {
  id: string;
  type: "direct" | "group" | "owner_group" | "ai_assistant";
  property_id: string | null;
  is_pinned: boolean;
  name: string | null;
  avatars: string[] | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface MessageRow extends QueryResultRow {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  body: string;
  system_type: ChatMessageType | null;
  extra_data: JsonObject | null;
  sent_at: string;
  attachments: MessageAttachment[] | null;
  reactions: Array<{ profile_id: string; emoji: string }> | null;
}

interface ChoreRow extends QueryResultRow {
  id: string;
  title: string;
  assignee_id: string;
  assignee_name: string;
  is_done: boolean;
  due_date: string | null;
}

interface ExpenseRow extends QueryResultRow {
  id: string;
  title: string;
  total_amount: number;
  shares: Array<{
    memberId: string;
    memberName: string;
    amount: number;
    isPaid: boolean;
  }> | null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function profileToCompatibility(row: ProfileRow): CompatibilityProfile {
  const preferences = row.preferences ?? {};
  return {
    budgetMin: row.budget_min ?? 0,
    budgetMax: row.budget_max ?? 150_000,
    districts: asStringArray(preferences.districts),
    moveInDate: row.move_in_date ?? new Date().toISOString().slice(0, 10),
    leaseMonths: row.lease_months ?? 12,
    smoking: asString(preferences.smoking, "no") as CompatibilityProfile["smoking"],
    pets: asString(preferences.pets, "no") as CompatibilityProfile["pets"],
    petTolerance: asString(preferences.pet_tolerance, "any") as CompatibilityProfile["petTolerance"],
    sleep: asString(preferences.sleep_schedule, "flexible") as CompatibilityProfile["sleep"],
    noise: asNumber(preferences.noise_tolerance, 3),
    guests: asString(preferences.guests_frequency, "sometimes") as CompatibilityProfile["guests"],
    remoteWork: asString(preferences.remote_work, "sometimes") as CompatibilityProfile["remoteWork"],
    cleanliness: asNumber(preferences.cleanliness, 3),
    cooking: asNumber(preferences.cooking, 3),
    sharedProducts: preferences.shared_products !== false,
    temperature: asNumber(preferences.temperature, 3),
    privateSpace: asNumber(preferences.private_space, 3),
    commonZones: asNumber(preferences.common_zones, 3),
    sociability: asNumber(preferences.sociability, 3),
    leisure: asStringArray(preferences.leisure),
  };
}

function profileTraits(preferences: JsonObject | null): string[] {
  const result: string[] = [];
  if (preferences?.smoking === "no") result.push("Не курит");
  if (preferences?.sleep_schedule === "early") result.push("Ранний режим");
  if (preferences?.sleep_schedule === "late") result.push("Поздний режим");
  if (preferences?.remote_work === "often") result.push("Работает из дома");
  if (asNumber(preferences?.cleanliness, 0) >= 4) result.push("Любит порядок");
  return result.length > 0 ? result.slice(0, 3) : ["Открыт к знакомству"];
}

async function storageUrl(
  path: string | null,
  bucket: StorageBucket,
  scope: { ownerId: string; scopeId: string },
  fallback = "/demo/properties/center-loft.jpg",
): Promise<string> {
  if (!path) return fallback;
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;
  const objectKey = assertScopedObjectKey(path, { bucket, ...scope });
  return (await createSignedDownloadUrl({ bucket, objectKey })).downloadUrl;
}

async function mapProperty(row: PropertyRow): Promise<DemoProperty> {
  const tags = [...(row.amenities ?? [])];
  if (row.pets_allowed) tags.push("Можно с животными");
  if (row.furnished) tags.push("С мебелью");
  if (row.source === "ap-r") tags.unshift("Партнёрское объявление");

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description ?? undefined,
    address: row.address,
    city: row.city,
    district: row.district,
    price: row.monthly_rent,
    deposit: row.deposit,
    rooms: row.rooms,
    area: Number(row.area),
    floor: row.total_floors ? `${row.floor ?? "—"}/${row.total_floors}` : String(row.floor ?? "—"),
    totalFloors: row.total_floors ?? undefined,
    availableFrom: row.available_from ?? undefined,
    leaseMonthsMin: row.lease_months_min,
    petsAllowed: row.pets_allowed,
    smokingAllowed: row.smoking_allowed,
    furnished: row.furnished,
    status: row.status ?? undefined,
    image: await storageUrl(
      row.image_path,
      STORAGE_BUCKETS.PROPERTY_IMAGES,
      { ownerId: row.owner_id, scopeId: row.id },
    ),
    match: 85,
    photosCount: Number(row.photos_count),
    tags,
    source: row.source ?? "user",
    externalId: row.external_id ?? undefined,
    originalUrl: row.source_url ?? undefined,
    developer: row.developer_name ?? undefined,
    complexName: row.complex_name ?? undefined,
    completionDate: row.completion_date ?? undefined,
    finishing: row.finishing_type ?? undefined,
    amenities: row.amenities ?? [],
    rules: Object.fromEntries(
      Object.entries(row.rules ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    ),
  };
}

function messageType(value: ChatMessageType | null): ChatMessageType {
  return value ?? "text";
}

function mapMessage(row: MessageRow, currentUserId: string): ChatMessage {
  const reactionCounts: Record<string, number> = {};
  const userReactions: string[] = [];
  for (const reaction of row.reactions ?? []) {
    reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] ?? 0) + 1;
    if (reaction.profile_id === currentUserId) userReactions.push(reaction.emoji);
  }

  const extra = row.extra_data ?? {};
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_id === currentUserId ? "Вы" : row.sender_name,
    senderAvatar: row.sender_avatar ?? undefined,
    content: row.body,
    body: row.body,
    timestamp: new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(row.sent_at)),
    sentAt: row.sent_at,
    type: messageType(row.system_type),
    propertyId: typeof extra.propertyId === "string" ? extra.propertyId : undefined,
    viewingData: extra.viewingData as ViewingBooking | undefined,
    pollData: extra.pollData as GroupPoll | undefined,
    expenseData: extra.expenseData as ExpenseSplit | undefined,
    voiceDuration: typeof extra.voiceDuration === "string" ? extra.voiceDuration : undefined,
    attachments: row.attachments ?? [],
    reactions: reactionCounts,
    userReactions,
  };
}

async function requireConversationMember(conversationId: string, profileId: string, client?: PoolClient): Promise<void> {
  const result = client
    ? await client.query(
        `select 1 from conversation_members where conversation_id = $1 and profile_id = $2 and archived_at is null`,
        [conversationId, profileId],
      )
    : await query(
        `select 1 from conversation_members where conversation_id = $1 and profile_id = $2 and archived_at is null`,
        [conversationId, profileId],
      );
  if (result.rowCount !== 1) throw new Error("Нет доступа к диалогу");
}

export class PostgresRepository extends BaseRepository implements Repository {
  async listRoommates(search = ""): Promise<DemoRoommate[]> {
    const currentUser = await getCurrentUser();
    const values: unknown[] = [currentUser?.id ?? null];
    let searchClause = "";
    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      searchClause = `and (p.display_name ilike $${values.length} or coalesce(p.job_title, '') ilike $${values.length})`;
    }

    const result = await query<ProfileRow>(
      `select p.id, p.display_name, p.age, p.job_title, p.budget_min, p.budget_max,
              p.city, p.avatar_path, p.move_in_date, p.lease_months,
              to_jsonb(pp) - 'profile_id' as preferences
         from profiles p
         left join profile_preferences pp on pp.profile_id = p.id
        where p.is_public = true and ($1::uuid is null or p.id <> $1::uuid)
              ${searchClause}
        order by p.updated_at desc
        limit 60`,
      values,
    );

    let ownProfile: CompatibilityProfile | null = null;
    if (currentUser) {
      const own = await query<ProfileRow>(
        `select p.id, p.display_name, p.age, p.job_title, p.budget_min, p.budget_max,
                p.city, p.avatar_path, p.move_in_date, p.lease_months,
                to_jsonb(pp) - 'profile_id' as preferences
           from profiles p left join profile_preferences pp on pp.profile_id = p.id
          where p.id = $1`,
        [currentUser.id],
      );
      if (own.rows[0]) ownProfile = profileToCompatibility(own.rows[0]);
    }

    const roommates = await Promise.all(result.rows.map(async (row) => ({
        id: row.id,
        name: row.display_name,
        age: row.age ?? 18,
        job: row.job_title ?? "Не указано",
        budget: row.budget_max ?? 0,
        district: row.city ?? "Россия",
        compatibility: ownProfile ? compatibilityScore(ownProfile, profileToCompatibility(row)).score : 0,
        image: await storageUrl(
          row.avatar_path,
          STORAGE_BUCKETS.AVATARS,
          { ownerId: row.id, scopeId: row.id },
          "/demo/people/maria.jpg",
        ),
        traits: profileTraits(row.preferences),
      })));
    return roommates.sort((left, right) => right.compatibility - left.compatibility);
  }

  async listProperties(filters: PropertyFilters = {}): Promise<DemoProperty[]> {
    const conditions = ["p.status = 'published'", "p.is_available = true"];
    const values: unknown[] = [];
    const add = (sql: string, value: unknown) => {
      values.push(value);
      conditions.push(sql.replace("?", `$${values.length}`));
    };

    if (filters.query?.trim()) {
      values.push(`%${filters.query.trim()}%`);
      conditions.push(`(p.title ilike $${values.length} or p.address ilike $${values.length})`);
    }
    if (filters.city) add("p.city = ?", filters.city);
    if (filters.districts?.length) add("p.district = any(?::text[])", filters.districts);
    if (filters.minPrice !== undefined) add("p.monthly_rent >= ?", filters.minPrice);
    if (filters.maxPrice !== undefined) add("p.monthly_rent <= ?", filters.maxPrice);
    if (filters.rooms?.length) add("p.rooms = any(?::int[])", filters.rooms);
    if (filters.petsAllowed !== undefined) add("p.pets_allowed = ?", filters.petsAllowed);
    if (filters.furnished !== undefined) add("p.furnished = ?", filters.furnished);
    if (filters.source && filters.source !== "all") add("p.source = ?", filters.source);

    let orderBy: string;
    const sortBy = filters.sortBy ?? "match";
    switch (sortBy) {
      case "price_asc":
        orderBy = "p.monthly_rent asc, p.created_at desc";
        break;
      case "price_desc":
        orderBy = "p.monthly_rent desc, p.created_at desc";
        break;
      case "newest":
        orderBy = "p.created_at desc";
        break;
      case "match":
        orderBy = "p.created_at desc";
        break;
      default: {
        const unreachable: never = sortBy;
        throw new Error(`Неизвестная сортировка: ${String(unreachable)}`);
      }
    }

    const result = await query<PropertyRow>(
      `select p.*,
              image.storage_path as image_path,
              coalesce(image_count.count, 0)::int as photos_count,
              coalesce(amenities.items, '{}') as amenities,
              coalesce(rules.items, '{}'::jsonb) as rules
         from properties p
         left join lateral (
           select pi.storage_path from property_images pi
            where pi.property_id = p.id order by pi.is_main desc, pi.sort_order asc limit 1
         ) image on true
         left join lateral (
           select count(*)::int as count from property_images pi where pi.property_id = p.id
         ) image_count on true
         left join lateral (
           select array_agg(a.name order by a.name) as items
             from property_amenities pa join amenities a on a.id = pa.amenity_id
            where pa.property_id = p.id
         ) amenities on true
         left join lateral (
           select jsonb_object_agg(pr.rule_type, coalesce(pr.description, pr.title)) as items
             from property_rules pr where pr.property_id = p.id
         ) rules on true
        where ${conditions.join(" and ")}
        order by ${orderBy}
        limit 100`,
      values,
    );
    return Promise.all(result.rows.map(mapProperty));
  }

  async getState(): Promise<DemoState> {
    const user = await requireUser();
    const [favorites, groupResult, applications, answers, threads, chores, expenses] = await Promise.all([
      query<{ subject_type: "profile" | "property"; subject_id: string }>(
        `select subject_type, subject_id from favorites where user_id = $1 order by created_at desc`,
        [user.id],
      ),
      query<GroupRow>(
        `select g.id, g.name, g.status, g.target_budget, g.move_in_date,
                array_remove(array_agg(gm.profile_id), null) as member_ids,
                coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'name', p.display_name))
                  filter (where p.id is not null), '[]'::jsonb) as members
           from groups g join group_members mine on mine.group_id = g.id and mine.profile_id = $1 and mine.status = 'active'
           left join group_members gm on gm.group_id = g.id and gm.status = 'active'
           left join profiles p on p.id = gm.profile_id
          group by g.id order by g.updated_at desc limit 1`,
        [user.id],
      ),
      query<ApplicationRow>(
        `select distinct a.id, a.property_id, a.group_id, a.tenant_message, a.status, a.created_at
           from applications a left join application_members am on am.application_id = a.id
          where a.created_by = $1 or am.profile_id = $1 order by a.created_at desc`,
        [user.id],
      ),
      query<{ question_key: string; answer: unknown; importance: number }>(
        `select question_key, answer, importance from lifestyle_answers where profile_id = $1 order by question_key`,
        [user.id],
      ),
      this.getChatThreads(),
      this.listChores(),
      this.listExpenses(),
    ]);

    const groupRow = groupResult.rows[0];
    const group: DemoGroup | null = groupRow
      ? {
          id: groupRow.id,
          name: groupRow.name,
          status: groupRow.status,
          memberIds: groupRow.member_ids ?? [],
          members: groupRow.members ?? [],
          targetBudget: groupRow.target_budget,
          moveInDate: groupRow.move_in_date,
          compatibility: 0,
        }
      : null;

    return {
      favorites: favorites.rows.map((item) => ({ type: item.subject_type, id: item.subject_id })),
      group,
      applications: applications.rows.map((item) => ({
        id: item.id,
        propertyId: item.property_id,
        groupId: item.group_id,
        message: item.tenant_message ?? undefined,
        status: item.status,
        createdAt: item.created_at,
      })),
      answers: answers.rows.map((item) => ({
        questionKey: item.question_key,
        answer: typeof item.answer === "string" ? item.answer : JSON.stringify(item.answer),
        importance: item.importance,
      })),
      threads,
      messages: {},
      chores,
      expenses,
    };
  }

  async toggleFavorite(type: "profile" | "property", id: string): Promise<DemoState> {
    const user = await requireUser();
    await withTransaction(async (client) => {
      const existing = await client.query(
        `select 1 from favorites where user_id = $1 and subject_type = $2 and subject_id = $3`,
        [user.id, type, id],
      );
      if (existing.rowCount) {
        await client.query(
          `delete from favorites where user_id = $1 and subject_type = $2 and subject_id = $3`,
          [user.id, type, id],
        );
      } else {
        await client.query(
          `insert into favorites (user_id, subject_type, subject_id) values ($1, $2, $3)`,
          [user.id, type, id],
        );
      }
    });
    return this.getState();
  }

  async saveAnswer(answer: DemoAnswer): Promise<DemoState> {
    const user = await requireUser();
    await query(
      `insert into lifestyle_answers (profile_id, question_key, answer, importance)
       values ($1, $2, $3::jsonb, $4)
       on conflict (profile_id, question_key) do update
       set answer = excluded.answer, importance = excluded.importance, updated_at = now()`,
      [user.id, answer.questionKey, JSON.stringify(answer.answer), answer.importance],
    );
    return this.getState();
  }

  async createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">): Promise<DemoGroup> {
    const user = await requireUser();
    const group = await withTransaction(async (client) => {
      const result = await client.query<GroupRow>(
        `insert into groups (name, target_budget, move_in_date, status, created_by)
         values ($1, $2, $3, 'forming', $4)
         returning id, name, status, target_budget, move_in_date`,
        [input.name.trim(), input.targetBudget, input.moveInDate, user.id],
      );
      const created = result.rows[0];
      await client.query(
        `insert into group_members (group_id, profile_id, role, status) values ($1, $2, 'admin', 'active')`,
        [created.id, user.id],
      );
      return created;
    });
    return {
      id: group.id,
      name: group.name,
      status: group.status,
      memberIds: [user.id],
      members: [],
      targetBudget: group.target_budget,
      moveInDate: group.move_in_date,
      compatibility: 100,
    };
  }

  async submitApplication(
    input: Pick<DemoApplication, "propertyId" | "groupId" | "message">,
  ): Promise<DemoApplication> {
    const user = await requireUser();
    const application = await withTransaction(async (client) => {
      const access = await client.query<{ target_budget: number; move_in_date: string }>(
        `select g.target_budget, g.move_in_date from groups g
         join group_members gm on gm.group_id = g.id
         where g.id = $1 and gm.profile_id = $2 and gm.status = 'active' and gm.role = 'admin'
         for update of g`,
        [input.groupId, user.id],
      );
      if (!access.rows[0]) throw new Error("Только создатель группы может отправить заявку");

      const property = await client.query<{ owner_id: string }>(
        `select owner_id from properties where id = $1 and status = 'published' and is_available = true`,
        [input.propertyId],
      );
      if (!property.rows[0]) throw new Error("Объявление больше недоступно");

      const duplicate = await client.query(
        `select 1 from applications where group_id = $1 and property_id = $2
          and status not in ('rejected', 'withdrawn')`,
        [input.groupId, input.propertyId],
      );
      if (duplicate.rowCount) throw new Error("Группа уже отправила заявку на этот объект");

      const result = await client.query<ApplicationRow>(
        `insert into applications
          (group_id, property_id, created_by, status, total_budget, tenant_message, move_in_date, lease_months)
         values ($1, $2, $3, 'submitted', $4, $5, $6, 12)
         returning id, property_id, group_id, tenant_message, status, created_at`,
        [input.groupId, input.propertyId, user.id, access.rows[0].target_budget, input.message?.trim() ?? null, access.rows[0].move_in_date],
      );
      const created = result.rows[0];
      await client.query(
        `insert into application_members (application_id, profile_id, rent_share)
         select $1, profile_id, 0 from group_members where group_id = $2 and status = 'active'`,
        [created.id, input.groupId],
      );
      await client.query(
        `insert into application_events (application_id, actor_id, from_status, to_status, note)
         values ($1, $2, null, 'submitted', 'Заявка отправлена собственнику')`,
        [created.id, user.id],
      );
      await client.query(`update groups set status = 'application_sent', updated_at = now() where id = $1`, [input.groupId]);
      await client.query(
        `insert into notifications (user_id, type, entity_type, entity_id, title, body, action_url)
         values ($1, 'application_created', 'application', $2, 'Новая заявка', 'Группа хочет арендовать ваш объект', $3)`,
        [property.rows[0].owner_id, created.id, `/owner/applications/${created.id}`],
      );
      return created;
    });
    return {
      id: application.id,
      propertyId: application.property_id,
      groupId: application.group_id,
      message: application.tenant_message ?? undefined,
      status: application.status,
      createdAt: application.created_at,
    };
  }

  async updateApplicationStatus(id: string, status: DemoApplication["status"]): Promise<DemoApplication> {
    const user = await requireUser();
    const updated = await withTransaction(async (client) => {
      const result = await client.query<ApplicationRow & { owner_id: string; created_by: string }>(
        `select a.id, a.property_id, a.group_id, a.tenant_message, a.status, a.created_at,
                p.owner_id, a.created_by
           from applications a join properties p on p.id = a.property_id
          where a.id = $1 for update of a`,
        [id],
      );
      const current = result.rows[0];
      if (!current) throw new Error("Заявка не найдена");

      const ownerTransitions: Record<string, DemoApplication["status"][]> = {
        submitted: ["reviewing", "needs_response", "approved", "rejected"],
        reviewing: ["needs_response", "approved", "rejected"],
        needs_response: ["reviewing", "approved", "rejected"],
        approved: ["contract_agreed", "rejected"],
        contract_agreed: ["settled"],
      };
      const tenantTransitions: Record<string, DemoApplication["status"][]> = {
        submitted: ["withdrawn"],
        reviewing: ["withdrawn"],
        needs_response: ["submitted", "withdrawn"],
        approved: ["contract_agreed", "withdrawn"],
      };
      const allowed = current.owner_id === user.id
        ? ownerTransitions[current.status]
        : current.created_by === user.id
          ? tenantTransitions[current.status]
          : undefined;
      if (!allowed?.includes(status)) throw new Error("Недопустимое изменение статуса заявки");

      const update = await client.query<ApplicationRow>(
        `update applications set status = $2, updated_at = now() where id = $1
         returning id, property_id, group_id, tenant_message, status, created_at`,
        [id, status],
      );
      await client.query(
        `insert into application_events (application_id, actor_id, from_status, to_status, note)
         values ($1, $2, $3, $4, $5)`,
        [id, user.id, current.status, status, `Статус изменён: ${status}`],
      );
      if (status === "rejected" || status === "withdrawn") {
        await client.query(`update groups set status = 'ready', updated_at = now() where id = $1`, [current.group_id]);
      }
      if (status === "settled") {
        await client.query(`update groups set status = 'settled', updated_at = now() where id = $1`, [current.group_id]);
        await client.query(`update properties set is_available = false, status = 'paused', updated_at = now() where id = $1`, [current.property_id]);
      }
      return update.rows[0];
    });
    return {
      id: updated.id,
      propertyId: updated.property_id,
      groupId: updated.group_id,
      message: updated.tenant_message ?? undefined,
      status: updated.status,
      createdAt: updated.created_at,
    };
  }

  async getChatThreads(): Promise<ChatThread[]> {
    const user = await requireUser();
    const result = await query<ThreadRow>(
      `select c.id, c.type, c.property_id, mine.is_pinned,
              case when c.type = 'group' then g.name
                   when c.type = 'owner_group' then coalesce(pr.title, 'Чат по заявке')
                   else string_agg(distinct nullif(p.display_name, mine_profile.display_name), ', ')
              end as name,
              array_remove(array_agg(distinct p.avatar_path), null) as avatars,
              last_message.body as last_message, last_message.sent_at as last_message_at,
              count(unread.id)::int as unread_count
         from conversation_members mine
         join conversations c on c.id = mine.conversation_id
         left join profiles mine_profile on mine_profile.id = mine.profile_id
         left join conversation_members cm on cm.conversation_id = c.id and cm.archived_at is null
         left join profiles p on p.id = cm.profile_id
         left join groups g on g.id = c.group_id
         left join properties pr on pr.id = c.property_id
         left join lateral (
           select m.body, m.sent_at from messages m where m.conversation_id = c.id and m.deleted_at is null
            order by m.sent_at desc limit 1
         ) last_message on true
         left join messages unread on unread.conversation_id = c.id and unread.sender_id <> $1
           and unread.sent_at > coalesce(mine.last_read_at, mine.joined_at) and unread.deleted_at is null
        where mine.profile_id = $1 and mine.archived_at is null
        group by c.id, mine.is_pinned, g.name, pr.title, last_message.body, last_message.sent_at
        order by mine.is_pinned desc, coalesce(last_message.sent_at, c.updated_at) desc`,
      [user.id],
    );
    return Promise.all(result.rows.map(async (row) => ({
      id: row.id,
      name: row.name || "Диалог",
      type: row.type === "direct" ? "roommate" : row.type === "group" ? "group" : "owner",
      avatar: undefined,
      avatars: undefined,
      propertyId: row.property_id ?? undefined,
      lastMessage: row.last_message ?? "Диалог создан",
      lastMessageTime: row.last_message_at
        ? new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(row.last_message_at))
        : "",
      unreadCount: row.unread_count,
      isPinned: row.is_pinned,
    })));
  }

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const user = await requireUser();
    await requireConversationMember(threadId, user.id);
    const result = await query<MessageRow>(
      `select m.id, m.sender_id, p.display_name as sender_name, p.avatar_path as sender_avatar,
              m.body, m.system_type, m.extra_data, m.sent_at,
              coalesce(attachments.items, '[]'::jsonb) as attachments,
              coalesce(reactions.items, '[]'::jsonb) as reactions
         from messages m join profiles p on p.id = m.sender_id
         left join lateral (
           select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.file_name, 'mime_type', a.mime_type,
                     'byte_size', a.byte_size, 'storage_path', a.storage_path) order by a.created_at) as items
             from message_attachments a where a.message_id = m.id
         ) attachments on true
         left join lateral (
           select jsonb_agg(jsonb_build_object('profile_id', r.profile_id, 'emoji', r.emoji)) as items
             from message_reactions r where r.message_id = m.id
         ) reactions on true
        where m.conversation_id = $1 and m.deleted_at is null
        order by m.sent_at asc limit 500`,
      [threadId],
    );
    return result.rows.map((row) => mapMessage(row, user.id));
  }

  async sendMessage(
    threadId: string,
    content: string,
    type: ChatMessageType = "text",
    extraData?: {
      propertyId?: string;
      viewingData?: ViewingBooking;
      pollData?: GroupPoll;
      expenseData?: ExpenseSplit;
      voiceDuration?: string;
      attachments?: MessageAttachment[];
      clientGeneratedId?: string;
    },
  ): Promise<ChatMessage> {
    const user = await requireUser();
    const body = content.trim();
    if (!body && !extraData?.attachments?.length) throw new Error("Сообщение не может быть пустым");
    if (body.length > 10_000) throw new Error("Сообщение слишком длинное");

    const messageId = await withTransaction(async (client) => {
      await requireConversationMember(threadId, user.id, client);
      const inserted = await client.query<{ id: string }>(
        `insert into messages
          (conversation_id, sender_id, body, system_type, extra_data, client_generated_id)
         values ($1, $2, $3, $4, $5::jsonb, $6)
         on conflict (client_generated_id) do update set client_generated_id = excluded.client_generated_id
         returning id`,
        [threadId, user.id, body, type, JSON.stringify(extraData ?? {}), extraData?.clientGeneratedId ?? null],
      );
      await client.query(`update conversations set updated_at = now() where id = $1`, [threadId]);
      await client.query(
        `update conversation_members set last_read_at = now() where conversation_id = $1 and profile_id = $2`,
        [threadId, user.id],
      );
      return inserted.rows[0].id;
    });
    const messages = await this.getMessages(threadId);
    const created = messages.find((message) => message.id === messageId);
    if (!created) throw new Error("Не удалось загрузить отправленное сообщение");
    return created;
  }

  async markThreadAsRead(threadId: string): Promise<void> {
    const user = await requireUser();
    const result = await query(
      `update conversation_members set last_read_at = now()
        where conversation_id = $1 and profile_id = $2 and archived_at is null`,
      [threadId, user.id],
    );
    if (!result.rowCount) throw new Error("Нет доступа к диалогу");
  }

  async voteInPoll(threadId: string, messageId: string, optionId: string): Promise<ChatMessage> {
    const user = await requireUser();
    await withTransaction(async (client) => {
      await requireConversationMember(threadId, user.id, client);
      const result = await client.query<{ extra_data: JsonObject }>(
        `select extra_data from messages where id = $1 and conversation_id = $2 for update`,
        [messageId, threadId],
      );
      const extra = result.rows[0]?.extra_data;
      const poll = extra?.pollData as GroupPoll | undefined;
      if (!poll) throw new Error("Опрос не найден");
      const options = poll.options.map((option) => ({
        ...option,
        voterIds: option.id === optionId
          ? Array.from(new Set([...option.voterIds.filter((id) => id !== user.id), user.id]))
          : option.voterIds.filter((id) => id !== user.id),
      }));
      const next = { ...extra, pollData: { ...poll, options, totalVotes: new Set(options.flatMap((o) => o.voterIds)).size } };
      await client.query(`update messages set extra_data = $2::jsonb, edited_at = now() where id = $1`, [messageId, JSON.stringify(next)]);
    });
    return this.requireMessage(threadId, messageId);
  }

  async updateViewingStatus(
    threadId: string,
    messageId: string,
    status: ViewingBooking["status"],
  ): Promise<ChatMessage> {
    const user = await requireUser();
    await requireConversationMember(threadId, user.id);
    const result = await query(
      `update messages set extra_data = jsonb_set(extra_data, '{viewingData,status}', to_jsonb($3::text), true), edited_at = now()
        where id = $1 and conversation_id = $2 and system_type = 'viewing_request'`,
      [messageId, threadId, status],
    );
    if (!result.rowCount) throw new Error("Приглашение на просмотр не найдено");
    return this.requireMessage(threadId, messageId);
  }

  async toggleExpensePaid(threadId: string, messageId: string, memberId: string): Promise<ChatMessage> {
    const user = await requireUser();
    await withTransaction(async (client) => {
      await requireConversationMember(threadId, user.id, client);
      if (memberId !== user.id) throw new Error("Можно отметить только свою долю");
      const result = await client.query<{ extra_data: JsonObject }>(
        `select extra_data from messages where id = $1 and conversation_id = $2 for update`,
        [messageId, threadId],
      );
      const extra = result.rows[0]?.extra_data;
      const expense = extra?.expenseData as ExpenseSplit | undefined;
      if (!expense) throw new Error("Расход не найден");
      const shares = expense.shares.map((share) => share.memberId === user.id ? { ...share, isPaid: !share.isPaid } : share);
      await client.query(`update messages set extra_data = $2::jsonb, edited_at = now() where id = $1`, [
        messageId,
        JSON.stringify({ ...extra, expenseData: { ...expense, shares } }),
      ]);
    });
    return this.requireMessage(threadId, messageId);
  }

  async togglePinThread(threadId: string): Promise<ChatThread[]> {
    const user = await requireUser();
    const result = await query(
      `update conversation_members set is_pinned = not is_pinned
        where conversation_id = $1 and profile_id = $2 and archived_at is null`,
      [threadId, user.id],
    );
    if (!result.rowCount) throw new Error("Нет доступа к диалогу");
    return this.getChatThreads();
  }

  async toggleMessageReaction(threadId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    const user = await requireUser();
    if (!emoji || emoji.length > 16) throw new Error("Некорректная реакция");
    await withTransaction(async (client) => {
      await requireConversationMember(threadId, user.id, client);
      const message = await client.query(`select 1 from messages where id = $1 and conversation_id = $2`, [messageId, threadId]);
      if (!message.rowCount) throw new Error("Сообщение не найдено");
      const existing = await client.query(
        `select 1 from message_reactions where message_id = $1 and profile_id = $2 and emoji = $3`,
        [messageId, user.id, emoji],
      );
      if (existing.rowCount) {
        await client.query(`delete from message_reactions where message_id = $1 and profile_id = $2 and emoji = $3`, [messageId, user.id, emoji]);
      } else {
        await client.query(`insert into message_reactions (message_id, profile_id, emoji) values ($1, $2, $3)`, [messageId, user.id, emoji]);
      }
    });
    return this.requireMessage(threadId, messageId);
  }

  async listChores(): Promise<DemoChore[]> {
    const user = await requireUser();
    const result = await query<ChoreRow>(
      `select c.id, c.title, c.assignee_id, p.display_name as assignee_name, c.is_done, c.due_date
         from chores c join profiles p on p.id = c.assignee_id
         join group_members gm on gm.group_id = c.group_id and gm.profile_id = $1 and gm.status = 'active'
        order by c.is_done asc, c.due_date asc nulls last, c.created_at desc`,
      [user.id],
    );
    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      assigneeId: row.assignee_id,
      assigneeName: row.assignee_name,
      isDone: row.is_done,
      dueDate: row.due_date ?? "Без срока",
    }));
  }

  async createChore(title: string, assigneeId: string, dueDate: string): Promise<DemoChore[]> {
    const user = await requireUser();
    const group = await query<{ group_id: string }>(
      `select group_id from group_members where profile_id = $1 and status = 'active' order by joined_at desc limit 1`,
      [user.id],
    );
    if (!group.rows[0]) throw new Error("Сначала создайте группу");
    const assignee = await query(
      `select 1 from group_members where group_id = $1 and profile_id = $2 and status = 'active'`,
      [group.rows[0].group_id, assigneeId],
    );
    if (!assignee.rowCount) throw new Error("Исполнитель не состоит в группе");
    await query(
      `insert into chores (group_id, title, assignee_id, due_date, created_by) values ($1, $2, $3, $4, $5)`,
      [group.rows[0].group_id, title.trim(), assigneeId, dueDate || null, user.id],
    );
    return this.listChores();
  }

  async toggleChoreDone(id: string): Promise<DemoChore[]> {
    const user = await requireUser();
    const result = await query(
      `update chores c set is_done = not c.is_done, completed_at = case when not c.is_done then now() else null end
        from group_members gm where c.id = $1 and gm.group_id = c.group_id and gm.profile_id = $2 and gm.status = 'active'`,
      [id, user.id],
    );
    if (!result.rowCount) throw new Error("Дело не найдено");
    return this.listChores();
  }

  async listExpenses(): Promise<ExpenseSplit[]> {
    const user = await requireUser();
    const result = await query<ExpenseRow>(
      `select e.id, e.title, e.total_amount,
              coalesce(jsonb_agg(jsonb_build_object(
                'memberId', em.profile_id, 'memberName', p.display_name,
                'amount', em.amount, 'isPaid', em.is_paid
              ) order by p.display_name) filter (where em.profile_id is not null), '[]'::jsonb) as shares
         from expenses e
         join group_members gm on gm.group_id = e.group_id and gm.profile_id = $1 and gm.status = 'active'
         left join expense_members em on em.expense_id = e.id
         left join profiles p on p.id = em.profile_id
        group by e.id order by e.created_at desc`,
      [user.id],
    );
    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      totalAmount: row.total_amount,
      shares: row.shares ?? [],
    }));
  }

  async createExpense(title: string, totalAmount: number, shares: ExpenseShare[]): Promise<ExpenseSplit[]> {
    const user = await requireUser();
    if (totalAmount <= 0 || shares.length === 0) throw new Error("Укажите сумму и участников");
    if (shares.reduce((sum, share) => sum + share.amount, 0) !== totalAmount) {
      throw new Error("Сумма долей должна совпадать с общей суммой");
    }
    await withTransaction(async (client) => {
      const group = await client.query<{ group_id: string }>(
        `select group_id from group_members where profile_id = $1 and status = 'active' order by joined_at desc limit 1`,
        [user.id],
      );
      if (!group.rows[0]) throw new Error("Сначала создайте группу");
      const members = await client.query<{ profile_id: string }>(
        `select profile_id from group_members where group_id = $1 and status = 'active'`,
        [group.rows[0].group_id],
      );
      const allowed = new Set(members.rows.map((row) => row.profile_id));
      if (shares.some((share) => !allowed.has(share.memberId))) throw new Error("В расходе есть посторонний участник");
      const expense = await client.query<{ id: string }>(
        `insert into expenses (group_id, title, total_amount, created_by) values ($1, $2, $3, $4) returning id`,
        [group.rows[0].group_id, title.trim(), totalAmount, user.id],
      );
      for (const share of shares) {
        await client.query(
          `insert into expense_members (expense_id, profile_id, amount, is_paid) values ($1, $2, $3, $4)`,
          [expense.rows[0].id, share.memberId, share.amount, share.isPaid],
        );
      }
    });
    return this.listExpenses();
  }

  async toggleGlobalExpensePaid(expenseId: string, memberId: string): Promise<ExpenseSplit[]> {
    const user = await requireUser();
    if (memberId !== user.id) throw new Error("Можно отметить только свою долю");
    const result = await query(
      `update expense_members em set is_paid = not em.is_paid, paid_at = case when not em.is_paid then now() else null end
        from expenses e, group_members gm
       where em.expense_id = $1 and em.profile_id = $2 and e.id = em.expense_id
         and gm.group_id = e.group_id and gm.profile_id = $2 and gm.status = 'active'`,
      [expenseId, user.id],
    );
    if (!result.rowCount) throw new Error("Доля расхода не найдена");
    return this.listExpenses();
  }

  private async requireMessage(threadId: string, messageId: string): Promise<ChatMessage> {
    const messages = await this.getMessages(threadId);
    const message = messages.find((item) => item.id === messageId);
    if (!message) throw new Error("Сообщение не найдено");
    return message;
  }
}
