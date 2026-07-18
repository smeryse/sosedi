"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(input: {
  title: string;
  description?: string;
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
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Профиль не найден");

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      owner_id: profile.id,
      title: input.title,
      description: input.description,
      district: input.district,
      address: input.address,
      monthly_rent: input.monthlyRent,
      deposit: input.deposit,
      rooms: input.rooms,
      area: input.area,
      floor: input.floor,
      total_floors: input.totalFloors,
      available_from: input.availableFrom,
      lease_months_min: input.leaseMonthsMin || 6,
      pets_allowed: input.petsAllowed || false,
      smoking_allowed: input.smokingAllowed || false,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw new Error("Не удалось создать объявление");

  revalidatePath("/owner/properties");
  return property;
}

export async function updateProperty(propertyId: string, updates: Partial<{
  title: string;
  description: string;
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
  status: "draft" | "published" | "paused" | "archived";
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("properties")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) throw new Error("Не удалось обновить объявление");
  revalidatePath("/owner/properties");
  revalidatePath(`/owner/properties/${propertyId}`);
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("properties")
    .update({ archived_at: new Date().toISOString(), status: "archived" })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) throw new Error("Не удалось удалить объявление");
  revalidatePath("/owner/properties");
  redirect("/owner/properties");
}

export async function uploadPropertyImages(propertyId: string, files: File[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Verify ownership
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.owner_id !== user.id) {
    throw new Error("Нет прав на это объявление");
  }

  const uploaded = [];

  for (const file of files) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${propertyId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `properties/${propertyId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(filePath, file, { upsert: false });

    if (uploadError) continue;

    const { data } = supabase.storage.from("property-images").getPublicUrl(filePath);

    // Save to DB
    const { error: dbError } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        storage_path: filePath,
        alt_text: file.name,
        sort_order: uploaded.length,
      });

    if (!dbError) {
      uploaded.push({ path: filePath, url: data.publicUrl });
    }
  }

  revalidatePath(`/owner/properties/${propertyId}/edit`);
  return uploaded;
}

export async function deletePropertyImage(imageId: string, propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Verify ownership
  const { data: image } = await supabase
    .from("property_images")
    .select("storage_path, property_id")
    .eq("id", imageId)
    .single();

  if (!image || image.property_id !== propertyId) {
    throw new Error("Изображение не найдено");
  }

  // Verify ownership
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.owner_id !== user.id) {
    throw new Error("Нет прав на это объявление");
  }

  // Delete from storage
  await supabase.storage.from("property-images").remove([image.storage_path]);

  // Delete from DB
  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error("Не удалось удалить изображение");

  revalidatePath(`/owner/properties/${propertyId}/edit`);
}

export async function addAmenity(propertyId: string, amenity: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  // Verify ownership
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.owner_id !== user.id) {
    throw new Error("Нет прав на это объявление");
  }

  const { error } = await supabase
    .from("property_amenities")
    .insert({ property_id: propertyId, amenity })
    .single();

  if (error) throw new Error("Не удалось добавить удобство");
  revalidatePath(`/owner/properties/${propertyId}/edit`);
}

export async function removeAmenity(propertyId: string, amenity: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("property_amenities")
    .delete()
    .eq("property_id", propertyId)
    .eq("amenity", amenity);

  if (error) throw new Error("Не удалось удалить удобство");
  revalidatePath(`/owner/properties/${propertyId}/edit`);
}

export async function setPropertyRules(propertyId: string, rules: Record<string, string>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.owner_id !== user.id) {
    throw new Error("Нет прав на это объявление");
  }

  // Delete old rules
  await supabase.from("property_rules").delete().eq("property_id", propertyId);

  // Insert new rules
  const rulesArray = Object.entries(rules).map(([key, value]) => ({
    property_id: propertyId,
    rule_key: key,
    rule_value: value,
  }));

  if (rulesArray.length > 0) {
    const { error } = await supabase.from("property_rules").insert(rulesArray);
    if (error) throw new Error("Не удалось сохранить правила");
  }

  revalidatePath(`/owner/properties/${propertyId}/edit`);
}

export async function getMyProperties(status?: "draft" | "published" | "paused" | "archived") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("properties")
    .select(`
      *,
      property_images (storage_path, alt_text, sort_order),
      property_amenities (amenity),
      property_rules (rule_key, rule_value)
    `)
    .eq("owner_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function getPropertyWithStats(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (storage_path, alt_text, sort_order),
      property_amenities (amenity),
      property_rules (rule_key, rule_value),
      applications (
        id,
        status,
        total_budget,
        move_in_date,
        group_id,
        groups (name, status),
        application_members (profile_id, rent_share, confirmed_at)
      )
    `)
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .single();

  if (error) throw new Error("Объявление не найдено");
  return property;
}

export async function publishProperty(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("properties")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) throw new Error("Не удалось опубликовать");
  revalidatePath("/owner/properties");
  revalidatePath(`/owner/properties/${propertyId}`);
}

export async function pauseProperty(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase
    .from("properties")
    .update({ status: "paused", updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) throw new Error("Не удалось приостановить");
  revalidatePath("/owner/properties");
  revalidatePath(`/owner/properties/${propertyId}`);
}