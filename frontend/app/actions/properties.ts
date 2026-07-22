"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db";
import { PropertyCreateSchema, PropertyUpdateSchema } from "@/lib/validators/schemas";

export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "rejected"
  | "archived";

type CreatePropertyInput = {
  title: string;
  description?: string;
  city?: string;
  district: string;
  address?: string;
  monthlyRent: number;
  deposit: number;
  rooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  availableFrom?: string;
  leaseMonthsMin?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  furnished?: boolean;
};

type PropertyUpdateInput = Partial<{
  title: string;
  description: string;
  city: string;
  district: string;
  address: string;
  monthly_rent: number;
  deposit: number;
  rooms: number;
  area: number;
  floor: number;
  total_floors: number;
  available_from: string;
  lease_months_min: number;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  furnished: boolean;
}>;

const PROPERTY_COLUMNS = [
  "title",
  "description",
  "city",
  "district",
  "address",
  "monthly_rent",
  "deposit",
  "rooms",
  "area",
  "floor",
  "total_floors",
  "available_from",
  "lease_months_min",
  "pets_allowed",
  "smoking_allowed",
  "furnished",
] as const;

function refreshPropertyPaths(propertyId?: string): void {
  revalidatePath("/owner");
  revalidatePath("/owner/properties");
  revalidatePath("/app/housing");
  if (propertyId) {
    revalidatePath(`/owner/properties/${propertyId}`);
    revalidatePath(`/app/housing/${propertyId}`);
  }
}

async function assertPropertyOwner(propertyId: string, ownerId: string): Promise<void> {
  const result = await query(
    `select 1 from properties where id = $1 and owner_id = $2 and status <> 'archived'`,
    [propertyId, ownerId],
  );
  if (!result.rowCount) throw new Error("Объект не найден или у вас нет доступа");
}

export async function createProperty(input: CreatePropertyInput) {
  const user = await requireRole("landlord", "admin");
  const parsed = PropertyCreateSchema.safeParse({
    title: input.title,
    description: input.description,
    city: input.city ?? "Краснодар",
    district: input.district,
    address: input.address ?? "Адрес будет указан после модерации",
    monthly_rent: input.monthlyRent,
    deposit: input.deposit,
    rooms: input.rooms,
    area: input.area,
    floor: input.floor ?? null,
    total_floors: input.totalFloors ?? null,
    available_from: input.availableFrom ?? null,
    lease_months_min: input.leaseMonthsMin ?? 6,
    pets_allowed: input.petsAllowed ?? false,
    smoking_allowed: input.smokingAllowed ?? false,
    furnished: input.furnished ?? false,
    status: "draft",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте данные объекта");

  const value = parsed.data;
  const result = await query(
    `insert into properties
      (owner_id, title, description, city, district, address, monthly_rent, deposit, rooms, area,
       floor, total_floors, available_from, lease_months_min, pets_allowed, smoking_allowed, furnished,
       status, source, is_available)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'draft','user',false)
     returning *`,
    [
      user.id,
      value.title,
      value.description ?? null,
      input.city ?? "Краснодар",
      value.district,
      value.address,
      value.monthly_rent,
      value.deposit,
      value.rooms,
      value.area,
      value.floor ?? null,
      value.total_floors ?? null,
      value.available_from ?? null,
      value.lease_months_min,
      value.pets_allowed,
      value.smoking_allowed,
      input.furnished ?? false,
    ],
  );
  refreshPropertyPaths(result.rows[0].id);
  return result.rows[0];
}

export async function updateProperty(propertyId: string, updates: PropertyUpdateInput) {
  const user = await requireRole("landlord", "admin");
  await assertPropertyOwner(propertyId, user.id);
  const parsed = PropertyUpdateSchema.safeParse(updates);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Проверьте изменения");

  const entries = PROPERTY_COLUMNS.flatMap((column) =>
    Object.prototype.hasOwnProperty.call(parsed.data, column)
      ? [[column, parsed.data[column as keyof typeof parsed.data]] as const]
      : [],
  );
  if (!entries.length) return getPropertyWithStats(propertyId);

  const assignments = entries.map(([column], index) => `${column} = $${index + 3}`);
  const result = await query(
    `update properties set ${assignments.join(", ")},
      status = case when status in ('published', 'pending_review') then 'pending_review' else status end,
      is_available = case when status in ('published', 'pending_review') then false else is_available end,
      updated_at = now()
     where id = $1 and owner_id = $2 returning *`,
    [propertyId, user.id, ...entries.map(([, value]) => value ?? null)],
  );
  if (!result.rows[0]) throw new Error("Не удалось обновить объект");
  refreshPropertyPaths(propertyId);
  return result.rows[0];
}

export async function deleteProperty(propertyId: string) {
  const user = await requireRole("landlord", "admin");
  const result = await query(
    `update properties set status = 'archived', is_available = false, archived_at = now(), updated_at = now()
      where id = $1 and owner_id = $2 and status <> 'archived'`,
    [propertyId, user.id],
  );
  if (!result.rowCount) throw new Error("Объект не найден");
  refreshPropertyPaths(propertyId);
  redirect("/owner/properties");
}

export async function uploadPropertyImages(_propertyId: string, _files: File[]) {
  throw new Error("Загрузка выполняется напрямую в защищённое хранилище через форму объекта");
}

export async function registerPropertyImage(input: {
  propertyId: string;
  storagePath: string;
  altText: string;
}) {
  const user = await requireRole("landlord", "admin");
  await assertPropertyOwner(input.propertyId, user.id);
  const result = await withTransaction(async (client) => {
    const existingCount = await client.query<{ count: number }>(
      `select count(*)::int as count from property_images where property_id = $1`,
      [input.propertyId],
    );
    if (existingCount.rows[0].count >= 30) throw new Error("Можно добавить не более 30 фотографий");
    return client.query(
      `insert into property_images (property_id, storage_path, alt_text, is_main, sort_order, uploaded_by)
       values ($1, $2, $3, $4, $5, $6) returning *`,
      [input.propertyId, input.storagePath, input.altText.slice(0, 240), existingCount.rows[0].count === 0, existingCount.rows[0].count, user.id],
    );
  });
  refreshPropertyPaths(input.propertyId);
  return result.rows[0];
}

export async function deletePropertyImage(imageId: string, propertyId: string) {
  const user = await requireRole("landlord", "admin");
  const deleted = await withTransaction(async (client) => {
    const result = await client.query<{ storage_path: string; is_main: boolean }>(
      `delete from property_images pi using properties p
        where pi.id = $1 and pi.property_id = $2 and p.id = pi.property_id and p.owner_id = $3
        returning pi.storage_path, pi.is_main`,
      [imageId, propertyId, user.id],
    );
    if (!result.rows[0]) throw new Error("Фотография не найдена");
    if (result.rows[0].is_main) {
      await client.query(
        `update property_images set is_main = true where id = (
           select id from property_images where property_id = $1 order by sort_order asc limit 1
         )`,
        [propertyId],
      );
    }
    return result.rows[0];
  });
  refreshPropertyPaths(propertyId);
  return deleted;
}

export async function addAmenity(propertyId: string, amenity: string) {
  const user = await requireRole("landlord", "admin");
  await assertPropertyOwner(propertyId, user.id);
  const normalized = amenity.trim().slice(0, 80);
  if (!normalized) throw new Error("Укажите удобство");
  await withTransaction(async (client) => {
    const item = await client.query<{ id: string }>(
      `insert into amenities (code, name) values (lower($1), $1)
       on conflict (code) do update set name = excluded.name returning id`,
      [normalized],
    );
    await client.query(
      `insert into property_amenities (property_id, amenity_id) values ($1, $2) on conflict do nothing`,
      [propertyId, item.rows[0].id],
    );
  });
  refreshPropertyPaths(propertyId);
}

export async function removeAmenity(propertyId: string, amenity: string) {
  const user = await requireRole("landlord", "admin");
  await assertPropertyOwner(propertyId, user.id);
  await query(
    `delete from property_amenities pa using amenities a
      where pa.property_id = $1 and pa.amenity_id = a.id and lower(a.name) = lower($2)`,
    [propertyId, amenity],
  );
  refreshPropertyPaths(propertyId);
}

export async function setPropertyRules(propertyId: string, rules: Record<string, string>) {
  const user = await requireRole("landlord", "admin");
  await assertPropertyOwner(propertyId, user.id);
  const normalized = Object.entries(rules)
    .map(([key, value]) => [key.trim().slice(0, 80), value.trim().slice(0, 500)] as const)
    .filter(([key, value]) => key && value)
    .slice(0, 30);
  await withTransaction(async (client) => {
    await client.query(`delete from property_rules where property_id = $1`, [propertyId]);
    for (const [key, value] of normalized) {
      await client.query(
        `insert into property_rules (property_id, rule_type, title, description, sort_order)
         values ($1, $2, $3, $4, $5)`,
        [propertyId, key, key, value, normalized.findIndex(([candidate]) => candidate === key)],
      );
    }
  });
  refreshPropertyPaths(propertyId);
}

export async function getMyProperties(status?: PropertyStatus) {
  const user = await requireRole("landlord", "admin");
  const values: unknown[] = [user.id];
  const statusClause = status ? `and p.status = $${values.push(status)}` : "";
  const result = await query(
    `select p.*,
            coalesce(images.items, '[]'::jsonb) as property_images,
            coalesce(amenities.items, '[]'::jsonb) as property_amenities,
            coalesce(rules.items, '[]'::jsonb) as property_rules,
            coalesce(stats.applications_count, 0)::int as applications_count,
            coalesce(stats.favorites_count, 0)::int as favorites_count
       from properties p
       left join lateral (
         select jsonb_agg(to_jsonb(pi) order by pi.is_main desc, pi.sort_order) as items
           from property_images pi where pi.property_id = p.id
       ) images on true
       left join lateral (
         select jsonb_agg(jsonb_build_object('id', a.id, 'code', a.code, 'name', a.name, 'category', a.category)) as items
           from property_amenities pa join amenities a on a.id = pa.amenity_id where pa.property_id = p.id
       ) amenities on true
       left join lateral (
         select jsonb_agg(to_jsonb(pr)) as items from property_rules pr where pr.property_id = p.id
       ) rules on true
       left join lateral (
         select count(distinct a.id) as applications_count,
                count(distinct f.user_id) as favorites_count
           from applications a full join favorites f on f.subject_type = 'property' and f.subject_id = p.id
          where a.property_id = p.id or f.subject_id = p.id
       ) stats on true
      where p.owner_id = $1 and p.status <> 'archived' ${statusClause}
      order by p.updated_at desc`,
    values,
  );
  return result.rows;
}

export async function getPropertyWithStats(propertyId: string) {
  const user = await requireRole("landlord", "admin");
  const result = await query(
    `select p.*,
            coalesce(images.items, '[]'::jsonb) as property_images,
            coalesce(amenities.items, '[]'::jsonb) as property_amenities,
            coalesce(rules.items, '[]'::jsonb) as property_rules,
            coalesce(applications.items, '[]'::jsonb) as applications
       from properties p
       left join lateral (select jsonb_agg(to_jsonb(pi) order by pi.is_main desc, pi.sort_order) items from property_images pi where pi.property_id = p.id) images on true
       left join lateral (
         select jsonb_agg(jsonb_build_object('id', a.id, 'code', a.code, 'name', a.name, 'category', a.category)) items
           from property_amenities pa join amenities a on a.id = pa.amenity_id where pa.property_id = p.id
       ) amenities on true
       left join lateral (select jsonb_agg(to_jsonb(pr)) items from property_rules pr where pr.property_id = p.id) rules on true
       left join lateral (
         select jsonb_agg(jsonb_build_object('id', a.id, 'status', a.status, 'total_budget', a.total_budget,
           'move_in_date', a.move_in_date, 'group_id', a.group_id, 'group_name', g.name) order by a.created_at desc) items
           from applications a join groups g on g.id = a.group_id where a.property_id = p.id
       ) applications on true
      where p.id = $1 and p.owner_id = $2 and p.status <> 'archived'`,
    [propertyId, user.id],
  );
  if (!result.rows[0]) throw new Error("Объект не найден");
  return result.rows[0];
}

export async function publishProperty(propertyId: string) {
  const user = await requireRole("landlord", "admin");
  const result = await query(
    `update properties p set status = 'pending_review', is_available = false, updated_at = now()
      where p.id = $1 and p.owner_id = $2 and p.status in ('draft', 'paused', 'rejected')
        and p.title <> '' and p.address <> '' and p.monthly_rent > 0 and p.rooms > 0 and p.area > 0
        and exists (select 1 from property_images pi where pi.property_id = p.id)
      returning *`,
    [propertyId, user.id],
  );
  if (!result.rows[0]) throw new Error("Для отправки на модерацию заполните данные и добавьте фотографию");
  await query(
    `insert into moderation_queue (target_type, target_id, status, submitted_by)
     values ('property', $1, 'pending', $2)
     on conflict (target_type, target_id) where status = 'pending' do nothing`,
    [propertyId, user.id],
  );
  refreshPropertyPaths(propertyId);
  return result.rows[0];
}

export async function pauseProperty(propertyId: string) {
  const user = await requireRole("landlord", "admin");
  const result = await query(
    `update properties set status = 'paused', is_available = false, updated_at = now()
      where id = $1 and owner_id = $2 and status = 'published' returning *`,
    [propertyId, user.id],
  );
  if (!result.rows[0]) throw new Error("Опубликованный объект не найден");
  refreshPropertyPaths(propertyId);
  return result.rows[0];
}
