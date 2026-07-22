import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/session";
import {
  withTransaction,
  type PoolClient,
  type QueryResultRow,
} from "@/lib/db";

const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_PROPERTY_FLOOR = 500;

const roleSchema = z.enum(["tenant", "landlord"]);
const amenitySchema = z.enum([
  "furniture",
  "wifi",
  "washer",
  "fridge",
  "air_conditioner",
  "dishwasher",
  "parking",
  "bath",
  "workspace",
]);

const amenityDetails: Readonly<
  Record<z.infer<typeof amenitySchema>, { name: string; category: string }>
> = {
  furniture: { name: "Мебель", category: "furniture" },
  wifi: { name: "Wi-Fi", category: "connectivity" },
  washer: { name: "Стиральная машина", category: "appliances" },
  fridge: { name: "Холодильник", category: "appliances" },
  air_conditioner: { name: "Кондиционер", category: "climate" },
  dishwasher: { name: "Посудомоечная машина", category: "appliances" },
  parking: { name: "Парковка", category: "parking" },
  bath: { name: "Ванна", category: "bathroom" },
  workspace: { name: "Рабочее место", category: "furniture" },
};

type FloorDetails = {
  floor: number;
  totalFloors: number | null;
};

function parseFloor(value: string): FloorDetails | null {
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  const floor = numbers[0];
  const totalFloors = numbers[1] ?? null;

  if (
    floor === undefined ||
    !Number.isInteger(floor) ||
    floor < 0 ||
    floor > MAX_PROPERTY_FLOOR ||
    (totalFloors !== null &&
      (!Number.isInteger(totalFloors) ||
        totalFloors < 1 ||
        totalFloors > MAX_PROPERTY_FLOOR ||
        floor > totalFloors))
  ) {
    return null;
  }

  return { floor, totalFloors };
}

function uniqueStrings<T extends string>(values: T[]): T[] {
  return [...new Set(values)];
}

const tenantPayloadSchema = z.object({
  profile: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .trim()
      .min(5)
      .max(40)
      .refine((value) => value.replace(/\D/g, "").length >= 10, {
        message: "Телефон должен содержать не меньше 10 цифр",
      }),
    age: z.number().int().min(18).max(120),
    city: z.string().trim().min(2).max(120),
  }),
  preferences: z.object({
    hobbies: z
      .array(z.string().trim().min(1).max(80))
      .min(2)
      .max(30)
      .transform(uniqueStrings),
    habits: z.object({
      smoking: z.enum(["yes", "no"]),
      alcohol: z.enum(["never", "sometimes", "often"]),
      pets: z.enum(["yes", "no"]),
      guests: z.enum(["never", "rarely", "often"]),
      schedule: z.enum(["early", "flexible", "late"]),
    }),
  }),
  search: z
    .object({
      districts: z
        .array(z.string().trim().min(1).max(120))
        .min(1)
        .max(30)
        .transform(uniqueStrings),
      budgetMin: z.number().int().min(0).max(10_000_000),
      budgetMax: z.number().int().min(0).max(10_000_000),
    })
    .refine((search) => search.budgetMax >= search.budgetMin, {
      message: "Максимальный бюджет должен быть не меньше минимального",
      path: ["budgetMax"],
    }),
});

const landlordPayloadSchema = z.object({
  property: z.object({
    address: z.string().trim().min(6).max(300),
    type: z.string().trim().min(1).max(80),
    rooms: z.number().int().min(1).max(100),
    area: z.number().positive().max(100_000),
    floor: z
      .string()
      .trim()
      .min(1)
      .max(40)
      .refine((value) => parseFloor(value) !== null, {
        message: "Укажите корректный этаж",
      }),
  }),
  terms: z.object({
    rent: z.number().int().positive().max(100_000_000),
    deposit: z.number().int().min(0).max(100_000_000),
    utilities: z.enum(["included", "separate"]),
    petsAllowed: z.boolean(),
    smokingAllowed: z.boolean(),
    lease: z.enum(["6", "11", "12_plus", "flexible"]),
  }),
  amenities: z.array(amenitySchema).min(1).max(9).transform(uniqueStrings),
  details: z.object({
    description: z.string().trim().min(30).max(1_200),
    buildingType: z.string().trim().min(1).max(120),
    year: z
      .number()
      .int()
      .min(1700)
      .max(new Date().getFullYear() + 1),
  }),
  photos: z
    .object({
      count: z.number().int().min(1).max(10),
      names: z.array(z.string().trim().min(1).max(255)).min(1).max(10),
    })
    .refine((photos) => photos.count === photos.names.length, {
      message: "Количество фотографий не совпадает со списком файлов",
      path: ["count"],
    }),
});

const envelopeSchema = z
  .object({
    role: roleSchema,
    tenant: z.unknown().optional(),
    landlord: z.unknown().optional(),
  })
  .passthrough();

type OnboardingEnvelope = z.infer<typeof envelopeSchema>;
type TenantPayload = z.infer<typeof tenantPayloadSchema>;
type LandlordPayload = z.infer<typeof landlordPayloadSchema>;

type PropertyRow = QueryResultRow & { id: string };
type ProfileCityRow = QueryResultRow & { city: string };

function tenantPayloadFromEnvelope(envelope: OnboardingEnvelope): unknown {
  if (envelope.tenant !== undefined) return envelope.tenant;

  return {
    profile: envelope.profile,
    preferences: envelope.preferences,
    search: envelope.search,
  };
}

function landlordPayloadFromEnvelope(envelope: OnboardingEnvelope): unknown {
  if (envelope.landlord !== undefined) return envelope.landlord;

  return {
    property: envelope.property,
    terms: envelope.terms,
    amenities: envelope.amenities,
    details: envelope.details,
    photos: envelope.photos,
  };
}

function noStoreJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
      pragma: "no-cache",
    },
  });
}

async function readRequestBody(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new OnboardingRequestError(413, "Запрос слишком большой");
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    throw new OnboardingRequestError(413, "Запрос слишком большой");
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new OnboardingRequestError(400, "Некорректный JSON");
  }
}

class OnboardingRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "OnboardingRequestError";
    this.status = status;
  }
}

async function saveTenantOnboarding(
  client: PoolClient,
  userId: string,
  payload: TenantPayload,
): Promise<void> {
  const profileResult = await client.query(
    `UPDATE profiles
     SET display_name = $2,
         phone = $3,
         age = $4,
         city = $5,
         budget_min = $6,
         budget_max = $7,
         onboarding_completed = TRUE,
         updated_at = NOW()
     WHERE id = $1`,
    [
      userId,
      payload.profile.name,
      payload.profile.phone,
      payload.profile.age,
      payload.profile.city,
      payload.search.budgetMin,
      payload.search.budgetMax,
    ],
  );
  if (profileResult.rowCount !== 1) {
    throw new Error("Onboarding profile is missing");
  }

  await client.query(
    `INSERT INTO profile_preferences (
       profile_id,
       districts,
       smoking,
       pets,
       sleep_schedule,
       guests_frequency,
       leisure
     )
     VALUES ($1, $2::TEXT[], $3, $4, $5, $6, $7::TEXT[])
     ON CONFLICT (profile_id) DO UPDATE
     SET districts = EXCLUDED.districts,
         smoking = EXCLUDED.smoking,
         pets = EXCLUDED.pets,
         sleep_schedule = EXCLUDED.sleep_schedule,
         guests_frequency = EXCLUDED.guests_frequency,
         leisure = EXCLUDED.leisure,
         updated_at = NOW()`,
    [
      userId,
      payload.search.districts,
      payload.preferences.habits.smoking,
      payload.preferences.habits.pets === "yes" ? "other" : "no",
      payload.preferences.habits.schedule,
      payload.preferences.habits.guests,
      payload.preferences.hobbies,
    ],
  );

  const answers = [
    { question_key: "leisure", answer: payload.preferences.hobbies },
    { question_key: "smoking", answer: payload.preferences.habits.smoking },
    { question_key: "alcohol", answer: payload.preferences.habits.alcohol },
    { question_key: "pets", answer: payload.preferences.habits.pets },
    { question_key: "guests", answer: payload.preferences.habits.guests },
    { question_key: "sleep", answer: payload.preferences.habits.schedule },
    { question_key: "districts", answer: payload.search.districts },
    {
      question_key: "budget",
      answer: {
        min: payload.search.budgetMin,
        max: payload.search.budgetMax,
      },
    },
  ];

  await client.query(
    `INSERT INTO lifestyle_answers (profile_id, question_key, answer, importance)
     SELECT $1, item.question_key, item.answer, 3
     FROM jsonb_to_recordset($2::JSONB) AS item(question_key TEXT, answer JSONB)
     ON CONFLICT (profile_id, question_key) DO UPDATE
     SET answer = EXCLUDED.answer,
         importance = EXCLUDED.importance,
         answered_at = NOW(),
         updated_at = NOW()`,
    [userId, JSON.stringify(answers)],
  );

  await client.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'onboarding.complete', 'profile', $1, $2::JSONB)`,
    [userId, JSON.stringify({ role: "tenant" })],
  );
}

function leaseMonths(value: LandlordPayload["terms"]["lease"]): number {
  switch (value) {
    case "6":
      return 6;
    case "11":
      return 11;
    case "12_plus":
      return 12;
    case "flexible":
      return 1;
    default: {
      const exhaustiveCheck: never = value;
      return exhaustiveCheck;
    }
  }
}

function propertyTitle(payload: LandlordPayload): string {
  return `${payload.property.type} · ${payload.property.address}`.slice(0, 160);
}

async function upsertProperty(
  client: PoolClient,
  userId: string,
  city: string,
  payload: LandlordPayload,
): Promise<string> {
  const floorDetails = parseFloor(payload.property.floor);
  if (!floorDetails) throw new Error("Validated floor could not be parsed");

  const existingResult = await client.query<PropertyRow>(
    `SELECT id
     FROM properties
     WHERE owner_id = $1 AND status = 'draft'
     ORDER BY created_at DESC
     LIMIT 1
     FOR UPDATE`,
    [userId],
  );
  const existing = existingResult.rows[0];
  const values: unknown[] = [
    userId,
    propertyTitle(payload),
    payload.details.description,
    payload.property.address,
    city,
    payload.terms.rent,
    payload.terms.deposit,
    payload.property.rooms,
    payload.property.area,
    floorDetails.floor,
    floorDetails.totalFloors,
    leaseMonths(payload.terms.lease),
    payload.terms.petsAllowed,
    payload.terms.smokingAllowed,
    payload.amenities.includes("furniture"),
  ];

  if (existing) {
    await client.query(
      `UPDATE properties
       SET title = $2,
           description = $3,
           address = $4,
           city = $5,
           district = 'Не указан',
           monthly_rent = $6,
           deposit = $7,
           rooms = $8,
           area = $9,
           floor = $10,
           total_floors = $11,
           lease_months_min = $12,
           pets_allowed = $13,
           smoking_allowed = $14,
           furnished = $15,
           is_available = TRUE,
           updated_at = NOW()
       WHERE id = $16 AND owner_id = $1`,
      [...values, existing.id],
    );
    return existing.id;
  }

  const insertedResult = await client.query<PropertyRow>(
    `INSERT INTO properties (
       owner_id,
       title,
       description,
       address,
       city,
       district,
       monthly_rent,
       deposit,
       rooms,
       area,
       floor,
       total_floors,
       lease_months_min,
       pets_allowed,
       smoking_allowed,
       furnished,
       status,
       source
     )
     VALUES (
       $1, $2, $3, $4, $5, 'Не указан', $6, $7, $8, $9, $10, $11,
       $12, $13, $14, $15, 'draft', 'user'
     )
     RETURNING id`,
    values,
  );
  const inserted = insertedResult.rows[0];
  if (!inserted) throw new Error("Draft property was not created");
  return inserted.id;
}

async function savePropertyAmenities(
  client: PoolClient,
  propertyId: string,
  amenities: LandlordPayload["amenities"],
): Promise<void> {
  const amenityRows = amenities.map((code) => ({
    code,
    ...amenityDetails[code],
  }));

  await client.query(
    `INSERT INTO amenities (code, name, category)
     SELECT item.code, item.name, item.category
     FROM jsonb_to_recordset($1::JSONB)
       AS item(code TEXT, name TEXT, category TEXT)
     ON CONFLICT (code) DO UPDATE
     SET name = EXCLUDED.name,
         category = EXCLUDED.category`,
    [JSON.stringify(amenityRows)],
  );
  await client.query(
    `DELETE FROM property_amenities WHERE property_id = $1`,
    [propertyId],
  );
  await client.query(
    `INSERT INTO property_amenities (property_id, amenity_id)
     SELECT $1, id
     FROM amenities
     WHERE code = ANY($2::TEXT[])`,
    [propertyId, amenities],
  );
}

async function savePropertyDetails(
  client: PoolClient,
  propertyId: string,
  payload: LandlordPayload,
): Promise<void> {
  await client.query(
    `DELETE FROM property_rules
     WHERE property_id = $1
       AND rule_type IN ('onboarding.building', 'onboarding.utilities')`,
    [propertyId],
  );
  await client.query(
    `INSERT INTO property_rules (
       property_id,
       rule_type,
       title,
       description,
       is_required,
       sort_order
     )
     VALUES
       ($1, 'onboarding.building', $2, $3, FALSE, 100),
       ($1, 'onboarding.utilities', $4, NULL, FALSE, 101)`,
    [
      propertyId,
      `${payload.property.type}, ${payload.details.buildingType}`,
      `${payload.details.year} год постройки`,
      payload.terms.utilities === "included"
        ? "Коммунальные услуги включены"
        : "Коммунальные услуги оплачиваются отдельно",
    ],
  );
}

async function saveLandlordOnboarding(
  client: PoolClient,
  userId: string,
  payload: LandlordPayload,
): Promise<string> {
  const profileResult = await client.query<ProfileCityRow>(
    `SELECT city FROM profiles WHERE id = $1 FOR UPDATE`,
    [userId],
  );
  const profile = profileResult.rows[0];
  if (!profile) throw new Error("Onboarding profile is missing");

  const propertyId = await upsertProperty(
    client,
    userId,
    profile.city,
    payload,
  );
  await savePropertyAmenities(client, propertyId, payload.amenities);
  await savePropertyDetails(client, propertyId, payload);
  await client.query(
    `UPDATE profiles
     SET onboarding_completed = TRUE, updated_at = NOW()
     WHERE id = $1`,
    [userId],
  );
  await client.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'onboarding.complete', 'property', $2, $3::JSONB)`,
    [
      userId,
      propertyId,
      JSON.stringify({
        role: "landlord",
        declared_photo_count: payload.photos.count,
      }),
    ],
  );

  return propertyId;
}

function validationError(
  message: string,
  error: z.ZodError,
): NextResponse {
  return noStoreJson(
    {
      error: { code: "INVALID_INPUT", message },
      details: error.flatten(),
    },
    400,
  );
}

export async function POST(request: Request) {
  try {
    const requestBody = await readRequestBody(request);
    const envelopeResult = envelopeSchema.safeParse(requestBody);
    if (!envelopeResult.success) {
      return validationError(
        "Некорректные данные онбординга",
        envelopeResult.error,
      );
    }

    const envelope = envelopeResult.data;
    const user = await requireUser();
    if (!user.roles.includes(envelope.role)) {
      return noStoreJson(
        {
          error: {
            code: "ROLE_MISMATCH",
            message: "Выбранная роль не совпадает с ролью аккаунта",
          },
        },
        403,
      );
    }

    if (envelope.role === "tenant") {
      const payloadResult = tenantPayloadSchema.safeParse(
        tenantPayloadFromEnvelope(envelope),
      );
      if (!payloadResult.success) {
        return validationError(
          "Некорректные данные арендатора",
          payloadResult.error,
        );
      }

      await withTransaction((client) =>
        saveTenantOnboarding(client, user.id, payloadResult.data),
      );
      return noStoreJson({ destination: "/app" });
    }

    const payloadResult = landlordPayloadSchema.safeParse(
      landlordPayloadFromEnvelope(envelope),
    );
    if (!payloadResult.success) {
      return validationError(
        "Некорректные данные собственника",
        payloadResult.error,
      );
    }

    const propertyId = await withTransaction((client) =>
      saveLandlordOnboarding(client, user.id, payloadResult.data),
    );
    return noStoreJson({ destination: "/owner", propertyId, id: propertyId });
  } catch (error) {
    if (error instanceof OnboardingRequestError) {
      return noStoreJson(
        { error: { code: "INVALID_REQUEST", message: error.message } },
        error.status,
      );
    }
    if (error instanceof AuthError) {
      return noStoreJson(
        {
          error: {
            code: error.code,
            message:
              error.status === 401
                ? "Необходима авторизация"
                : "Недостаточно прав",
          },
        },
        error.status,
      );
    }

    console.error("[onboarding] Failed to save onboarding", error);
    return noStoreJson(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Не удалось сохранить анкету. Попробуйте ещё раз.",
        },
      },
      500,
    );
  }
}
