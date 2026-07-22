import type { DemoProperty, DemoRoommate } from "@/data/demo";
import { createClient } from "@/lib/supabase/server";
import { compatibilityScore } from "@/lib/compatibility/engine";
import type { CompatibilityProfile } from "@/lib/compatibility/types";
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
  PropertyFilters,
  Repository,
  ViewingBooking,
} from "./types";
import { BaseRepository } from "./base-repository";
import type { Database } from "@/lib/supabase/types";

type DbProfile = Database["public"]["Tables"]["profiles"]["Row"] & { profile_preferences?: any };
type DbProperty = Database["public"]["Tables"]["properties"]["Row"] & { property_images?: any };
type DbGroup = Database["public"]["Tables"]["groups"]["Row"];
type DbApplication = Database["public"]["Tables"]["applications"]["Row"];
type DbMessage = Database["public"]["Tables"]["messages"]["Row"] & { profiles?: any };
type DbChore = Database["public"]["Tables"]["chores"]["Row"];
type DbExpense = Database["public"]["Tables"]["expenses"]["Row"];


function mapProfileToCompatibility(
  profile: Record<string, any>,
  pref?: Record<string, any> | null,
): CompatibilityProfile {
  return {
    budgetMin: profile.budget_min ?? 0,
    budgetMax: profile.budget_max ?? 150000,
    districts: pref?.districts ?? [],
    moveInDate: profile.move_in_date ?? new Date().toISOString().split("T")[0],
    leaseMonths: profile.lease_months ?? 12,
    smoking: pref?.smoking === "yes" ? "yes" : pref?.smoking === "sometimes" ? "sometimes" : "no",
    pets: pref?.pets === "cat" ? "cat" : pref?.pets === "dog" ? "dog" : pref?.pets === "other" ? "other" : "no",
    petTolerance: pref?.pet_tolerance ?? "any",
    sleep: pref?.sleep_schedule === "early" ? "early" : pref?.sleep_schedule === "late" ? "late" : "flexible",
    noise: pref?.noise_tolerance ?? 3,
    guests: pref?.guests_frequency ?? "sometimes",
    remoteWork: pref?.remote_work ?? "sometimes",
    cleanliness: pref?.cleanliness ?? 3,
    cooking: pref?.cooking ?? 3,
    sharedProducts: pref?.shared_products ?? true,
    temperature: pref?.temperature ?? 3,
    privateSpace: pref?.private_space ?? 3,
    commonZones: pref?.common_zones ?? 3,
    sociability: pref?.sociability ?? 3,
    leisure: pref?.leisure ?? [],
  };
}

export class SupabaseRepository extends BaseRepository implements Repository {
  private async getUserId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  }

  private async ensureProfileExists(userId: string) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email ?? "User";
      const displayName = user?.user_metadata?.display_name || email.split("@")[0] || "Пользователь";

      await supabase
        .from("profiles")
        .insert({
          id: userId,
          display_name: displayName,
          age: 25,
          city: "Краснодар",
          is_public: true,
        });

      await supabase
        .from("profile_preferences")
        .insert({
          profile_id: userId,
          districts: [],
        });
    }
  }

  private async getActiveGroupContext(): Promise<{
    userId: string;
    groupId: string;
    members: Array<{ id: string; name: string }>;
  }> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("profile_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      throw new Error("Сначала создайте группу или примите приглашение.");
    }

    const { data: memberRows, error: membersError } = await supabase
      .from("group_members")
      .select("profile_id")
      .eq("group_id", membership.group_id)
      .eq("status", "active");

    if (membersError) throw new Error("Не удалось загрузить участников группы.");

    const memberIds = (memberRows ?? []).map((member: any) => member.profile_id);
    const { data: profiles, error: profilesError } = memberIds.length
      ? await supabase.from("profiles").select("id, display_name").in("id", memberIds)
      : { data: [], error: null };

    if (profilesError) throw new Error("Не удалось загрузить профили участников.");

    return {
      userId,
      groupId: membership.group_id,
      members: (profiles ?? []).map((profile: any) => ({ id: profile.id, name: profile.display_name })),
    };
  }

  private resolveMemberId(
    memberId: string,
    context: { userId: string; members: Array<{ id: string; name: string }> },
  ): string {
    if (memberId === "anna") return context.userId;
    if (context.members.some((member) => member.id === memberId)) return memberId;

    const demoNames: Record<string, string> = {
      maria: "мария",
      artem: "артём",
      ekaterina: "екатерина",
    };
    const expectedName = demoNames[memberId];
    return context.members.find((member) => member.name.toLowerCase().startsWith(expectedName ?? ""))?.id
      ?? context.userId;
  }

  async listRoommates(query = "") {
    const supabase = await createClient();
    const currentUserId = await this.getUserId();

    let request = supabase
      .from("profiles")
      .select(`
        id, display_name, age, job_title, budget_max, city, avatar_path, move_in_date, lease_months,
        profile_preferences ( districts, smoking, pets, sleep_schedule, noise_tolerance, guests_frequency, remote_work, cleanliness, private_space, sociability )
      `)
      .eq("is_public", true)
      .is("archived_at", null);

    if (currentUserId) {
      request = request.neq("id", currentUserId);
    }

    const { data: profiles, error } = await request.limit(50);
    if (error) throw new Error("Не удалось загрузить каталог соседей.");

    let currentUserComp: CompatibilityProfile | null = null;
    if (currentUserId) {
      await this.ensureProfileExists(currentUserId);
      const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select(`
          id, budget_min, budget_max, move_in_date, lease_months,
          profile_preferences ( districts, smoking, pets, sleep_schedule, noise_tolerance, guests_frequency, remote_work, cleanliness, private_space, sociability )
        `)
        .eq("id", currentUserId)
        .single();

      if (currentUserProfile) {
        currentUserComp = mapProfileToCompatibility(
          currentUserProfile,
          currentUserProfile.profile_preferences
        );
      }
    }

    const roommates: DemoRoommate[] = (profiles ?? []).map((profile: any) => {
      const pref = profile.profile_preferences;
      const traits: string[] = [];
      if (pref?.sleep_schedule === "early") traits.push("Жаворонок");
      if (pref?.sleep_schedule === "late") traits.push("Сова");
      if (pref?.smoking === "no") traits.push("Не курит");
      if (pref?.pets === "no") traits.push("Без питомцев");
      if (pref?.remote_work === "often") traits.push("Удалёнка");
      if (traits.length === 0) traits.push("Сожитель");

      const targetComp = mapProfileToCompatibility(profile, pref);
      const compResult = currentUserComp ? compatibilityScore(currentUserComp, targetComp) : { score: 85 };

      return {
        id: profile.id,
        name: profile.display_name,
        age: profile.age ?? 25,
        job: profile.job_title ?? "Специалист",
        budget: profile.budget_max ?? 25_000,
        district: profile.city,
        compatibility: compResult.score,
        image: profile.avatar_path || `/demo/people/${profile.id === "maria" ? "maria" : "artem"}.jpg`,
        traits,
      };
    });

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? roommates.filter((r) =>
          r.name.toLowerCase().includes(normalizedQuery) ||
          r.job.toLowerCase().includes(normalizedQuery) ||
          r.traits.some((t) => t.toLowerCase().includes(normalizedQuery))
        )
      : roommates;

    return filtered.sort((a, b) => b.compatibility - a.compatibility);
  }

  async listProperties(filters: PropertyFilters = {}) {
    const supabase = await createClient();
    const { query, city, districts, minPrice, maxPrice, rooms, petsAllowed, furnished, sortBy } = filters;
    
    let request = supabase
      .from("properties")
      .select(`
        id, owner_id, title, description, city, district, address, monthly_rent, deposit,
        rooms, area, floor, total_floors, available_from, lease_months_min,
        pets_allowed, smoking_allowed, status, source, source_url, external_id,
        developer_name, complex_name, completion_date, finishing_type,
        property_images ( storage_path, sort_order ),
        property_amenities ( amenity ),
        property_rules ( rule_key, rule_value )
      `)
      .eq("status", "published")
      .is("archived_at", null)
      .limit(100);

    if (city) {
      request = request.ilike("address", `%${city}%`);
    }

    if (districts && districts.length > 0) {
      request = request.in("district", districts);
    }

    if (minPrice !== undefined) {
      request = request.gte("monthly_rent", minPrice);
    }
    if (maxPrice !== undefined) {
      request = request.lte("monthly_rent", maxPrice);
    }

    if (rooms && rooms.length > 0) {
      request = request.in("rooms", rooms);
    }

    const { data: properties, error } = await request;

    if (error) throw new Error("Не удалось загрузить каталог жилья.");

    let mapped: DemoProperty[] = (properties ?? []).map((prop: any) => {
      const photos = [...(prop.property_images ?? [])].sort(
        (left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0),
      );
      const storagePath = photos[0]?.storage_path;
      const imagePath = storagePath
        ? supabase.storage.from("property-images").getPublicUrl(storagePath).data.publicUrl
        : "/demo/properties/center-loft.jpg";
      const amenities = (prop.property_amenities ?? []).map(
        (item: { amenity: string }) => item.amenity,
      );
      const rules = Object.fromEntries(
        (prop.property_rules ?? []).map(
          (item: { rule_key: string; rule_value: string }) => [item.rule_key, item.rule_value],
        ),
      );
      return {
        id: prop.id,
        title: prop.title,
        description: prop.description ?? undefined,
        address: prop.address ?? `${city || "Краснодар"}, ${prop.district}`,
        district: prop.district,
        city: prop.city || "Краснодар",
        price: prop.monthly_rent,
        deposit: prop.deposit ?? 0,
        rooms: prop.rooms,
        area: Number(prop.area),
        floor: prop.floor ? `${prop.floor}/${prop.total_floors ?? 9}` : "5/12",
        totalFloors: prop.total_floors ?? undefined,
        availableFrom: prop.available_from ?? undefined,
        leaseMonthsMin: prop.lease_months_min ?? undefined,
        petsAllowed: prop.pets_allowed ?? false,
        smokingAllowed: prop.smoking_allowed ?? false,
        furnished: amenities.includes("furniture"),
        status: prop.status,
        ownerId: prop.owner_id,
        image: imagePath,
        match: 86,
        photosCount: photos.length,
        tags: amenities,
        amenities,
        rules,
        source: prop.source === "ap-r" ? "ap-r" : "user",
        externalId: prop.external_id ?? undefined,
        originalUrl: prop.source_url ?? undefined,
        developer: prop.developer_name ?? undefined,
        complexName: prop.complex_name ?? undefined,
        completionDate: prop.completion_date ?? undefined,
        finishing: prop.finishing_type ?? undefined,
      };
    });

    const normalizedQuery = query?.trim().toLowerCase() || "";
    mapped = mapped.filter((p) => {
      if (normalizedQuery) {
        const searchable = [p.title, p.district, p.address].join(" ").toLowerCase();
        if (!searchable.includes(normalizedQuery)) return false;
      }
      
      if (petsAllowed !== undefined) {
        if (p.petsAllowed !== petsAllowed) return false;
      }
      
      if (furnished !== undefined) {
        if (p.furnished !== furnished) return false;
      }
      
      return true;
    });

    switch (sortBy) {
      case "price_asc":
        mapped.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        mapped.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        mapped.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "match":
      default:
        mapped.sort((a, b) => b.match - a.match);
        break;
    }

    return mapped;
  }

  async getState(): Promise<DemoState> {
    const supabase = await createClient();
    const userId = await this.getUserId();

    if (!userId) {
      return {
        favorites: [],
        group: null,
        applications: [],
        answers: [],
        threads: [],
        messages: {},
        chores: [],
        expenses: [],
      };
    }

    await this.ensureProfileExists(userId);

    // 1. Favorites
    const { data: favs } = await supabase
      .from("favorites")
      .select("target_type, target_id")
      .eq("user_id", userId);

    const favorites = (favs ?? []).map((f: any) => ({
      type: f.target_type as "profile" | "property",
      id: String(f.target_id),
    }));

    // 2. Answers
    const { data: ans } = await supabase
      .from("lifestyle_answers")
      .select("question_key, answer, importance")
      .eq("profile_id", userId);

    const answers = (ans ?? []).map((a: any) => ({
      questionKey: String(a.question_key),
      answer: String(a.answer),
      importance: a.importance as any,
    }));

    // 3. Group
    const { data: groupMember } = await supabase
      .from("group_members")
      .select("group_id, role, status")
      .eq("profile_id", userId)
      .eq("status", "active")
      .maybeSingle();

    let group: DemoGroup | null = null;
    let applications: DemoApplication[] = [];

    if (groupMember) {
      const { data: g } = await supabase
        .from("groups")
        .select("id, name, status, target_budget, move_in_date")
        .eq("id", groupMember.group_id)
        .single();

      if (g) {
        const { data: members } = await supabase
          .from("group_members")
          .select("profile_id, profiles ( id, display_name )")
          .eq("group_id", g.id)
          .eq("status", "active");

        group = {
          id: g.id,
          name: g.name,
          status: g.status as any,
          memberIds: (members ?? []).map((m: Record<string, unknown>) => m.profile_id as string),
          members: (members ?? []).map((m: Record<string, unknown>) => ({
            id: m.profile_id as string,
            name: (m as any).profiles?.display_name || "Сожитель"
          })),
          targetBudget: g.target_budget ?? 90000,
          moveInDate: g.move_in_date ?? "",
          compatibility: 89,
        };

        // 4. Applications
        const { data: apps } = await supabase
          .from("applications")
          .select("id, property_id, group_id, status, tenant_message, created_at")
          .eq("group_id", g.id);

        applications = (apps ?? []).map((a: any) => ({
          id: a.id,
          propertyId: a.property_id,
          groupId: a.group_id,
          message: a.tenant_message ?? undefined,
          status: a.status as any,
          createdAt: a.created_at,
        }));
      }
    }

    const threads = await this.getChatThreads();
    const messages: Record<string, ChatMessage[]> = {};
    for (const t of threads) {
      messages[t.id] = await this.getMessages(t.id);
    }

    const [chores, expenses] = await Promise.all([
      group ? this.listChores() : Promise.resolve([]),
      group ? this.listExpenses() : Promise.resolve([]),
    ]);

    return {
      favorites,
      group,
      applications,
      answers,
      threads,
      messages,
      chores,
      expenses,
    };
  }

  async toggleFavorite(type: "profile" | "property", id: string): Promise<DemoState> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) return this.getState();

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("target_type", type)
      .eq("target_id", id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase
        .from("favorites")
        .insert({
          user_id: userId,
          target_type: type,
          target_id: id,
        });
    }

    return this.getState();
  }

  async saveAnswer(answer: DemoAnswer): Promise<DemoState> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) return this.getState();

    await this.ensureProfileExists(userId);

    await supabase
      .from("lifestyle_answers")
      .upsert({
        profile_id: userId,
        question_key: answer.questionKey,
        answer: answer.answer,
        importance: answer.importance,
      }, { onConflict: "profile_id, question_key" });

    if (answer.questionKey === "budget") {
      let maxBudget = 30000;
      if (answer.answer.includes("20 000–30 000")) maxBudget = 30000;
      else if (answer.answer.includes("30 000–45 000")) maxBudget = 45000;
      else if (answer.answer.includes("До 20 000")) maxBudget = 20000;

      await supabase
        .from("profiles")
        .update({ budget_max: maxBudget })
        .eq("id", userId);
    } else if (answer.questionKey === "moveInDate") {
      const moveInDate = answer.answer.includes("В течение месяца")
        ? new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]
        : new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

      await supabase
        .from("profiles")
        .update({ move_in_date: moveInDate })
        .eq("id", userId);
    } else if (answer.questionKey === "leaseMonths") {
      const lease = answer.answer.includes("3–6 месяцев") ? 6 : 12;
      await supabase
        .from("profiles")
        .update({ lease_months: lease })
        .eq("id", userId);
    } else if (answer.questionKey === "sleep") {
      const sleep = answer.answer.includes("Рано") ? "early" : answer.answer.includes("Поздно") ? "late" : "flexible";
      await supabase
        .from("profile_preferences")
        .update({ sleep_schedule: sleep })
        .eq("profile_id", userId);
    } else if (answer.questionKey === "smoking") {
      const smoking = answer.answer.includes("Не курю") ? "no" : answer.answer.includes("Иногда") ? "sometimes" : "yes";
      await supabase
        .from("profile_preferences")
        .update({ smoking: smoking })
        .eq("profile_id", userId);
    } else if (answer.questionKey === "pets") {
      const pets = answer.answer.includes("кошка") ? "cat" : answer.answer.includes("собака") ? "dog" : "no";
      await supabase
        .from("profile_preferences")
        .update({ pets: pets })
        .eq("profile_id", userId);
    } else if (answer.questionKey === "noise") {
      const noise = answer.answer.includes("тишину") ? 1 : answer.answer.includes("Умеренный") ? 3 : 5;
      await supabase
        .from("profile_preferences")
        .update({ noise_tolerance: noise })
        .eq("profile_id", userId);
    } else if (answer.questionKey === "guests") {
      const guests = answer.answer.includes("никогда") ? "never" : answer.answer.includes("Иногда") ? "sometimes" : "often";
      await supabase
        .from("profile_preferences")
        .update({ guests_frequency: guests })
        .eq("profile_id", userId);
    } else if (answer.questionKey === "remoteWork") {
      const remote = answer.answer.includes("Не работаю") ? "never" : answer.answer.includes("Иногда") ? "sometimes" : "often";
      await supabase
        .from("profile_preferences")
        .update({ remote_work: remote })
        .eq("profile_id", userId);
    } else if (answer.questionKey === "cleanliness") {
      const clean = answer.answer.includes("чисто") ? 5 : answer.answer.includes("Умеренный") ? 3 : 1;
      await supabase
        .from("profile_preferences")
        .update({ cleanliness: clean })
        .eq("profile_id", userId);
    }

    return this.getState();
  }

  async createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">): Promise<DemoGroup> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    const { data: g, error: gErr } = await supabase
      .from("groups")
      .insert({
        name: input.name,
        target_budget: input.targetBudget,
        move_in_date: input.moveInDate,
        created_by: userId,
        status: "forming",
      })
      .select("id, name, status, target_budget, move_in_date")
      .single();

    if (gErr || !g) throw new Error("Не удалось создать группу.");

    await supabase
      .from("group_members")
      .insert({
        group_id: g.id,
        profile_id: userId,
        role: "admin",
        status: "active",
        joined_at: new Date().toISOString(),
      });

    return {
      id: g.id,
      name: g.name,
      status: g.status as any,
      memberIds: [userId],
      targetBudget: g.target_budget ?? 90000,
      moveInDate: g.move_in_date ?? "",
      compatibility: 82,
    };
  }

  async submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId" | "message">): Promise<DemoApplication> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    const { data: prop } = await supabase
      .from("properties")
      .select("monthly_rent")
      .eq("id", input.propertyId)
      .single();

    const rent = prop?.monthly_rent ?? 30000;

    const { data: app, error } = await supabase
      .from("applications")
      .insert({
        group_id: input.groupId,
        property_id: input.propertyId,
        created_by: userId,
        status: "submitted",
        total_budget: rent,
        tenant_message: input.message?.trim() || null,
      })
      .select("id, property_id, group_id, status, tenant_message, created_at")
      .single();

    if (error || !app) throw new Error("Не удалось подать заявку.");

    const { data: members } = await supabase
      .from("group_members")
      .select("profile_id")
      .eq("group_id", input.groupId)
      .eq("status", "active");

    const share = Math.round(rent / Math.max(1, members?.length ?? 1));

    if (members) {
      for (const m of members) {
        await supabase
          .from("application_members")
          .insert({
            application_id: app.id,
            profile_id: m.profile_id,
            rent_share: share,
          });
      }
    }

    await supabase
      .from("application_events")
      .insert({
        application_id: app.id,
        actor_id: userId,
        from_status: "draft",
        to_status: "submitted",
        note: "Заявка отправлена на рассмотрение собственнику.",
      });

    return {
      id: app.id,
      propertyId: app.property_id,
      groupId: app.group_id,
      message: app.tenant_message ?? undefined,
      status: app.status as any,
      createdAt: app.created_at,
    };
  }

  async updateApplicationStatus(id: string, status: DemoApplication["status"]): Promise<DemoApplication> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    const { data: existingApp } = await supabase
      .from("applications")
      .select("status")
      .eq("id", id)
      .single();

    const fromStatus = existingApp?.status || "submitted";

    const { data: updated, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id)
      .select("id, property_id, group_id, status, tenant_message, created_at")
      .single();

    if (error || !updated) throw new Error("Не удалось обновить статус заявки.");

    await supabase
      .from("application_events")
      .insert({
        application_id: updated.id,
        actor_id: userId,
        from_status: fromStatus,
        to_status: status,
        note: `Статус заявки изменён на ${status}`,
      });

    return {
      id: updated.id,
      propertyId: updated.property_id,
      groupId: updated.group_id,
      message: updated.tenant_message ?? undefined,
      status: updated.status as any,
      createdAt: updated.created_at,
    };
  }

  private async getOrCreateAiConversationId(supabase: any, userId: string): Promise<string> {
    const { data: existing } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: created, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: userId, provider: "groq" })
      .select("id")
      .single();

    if (error || !created) throw new Error("Не удалось создать сессию AI-чата.");
    return created.id;
  }

  async getChatThreads(): Promise<ChatThread[]> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data: memberships } = await supabase
      .from("conversation_members")
      .select("conversation_id, is_pinned")
      .eq("profile_id", userId);

    const convIds = (memberships ?? []).map((membership: any) => membership.conversation_id);
    const pinnedByConversation = new Map(
      (memberships ?? []).map((membership: any) => [membership.conversation_id, membership.is_pinned]),
    );

    let dbThreads: ChatThread[] = [];

    if (convIds.length > 0) {
      const { data: conversations } = await supabase
        .from("conversations")
        .select(`
          id, type, property_id,
          conversation_members ( profile_id, profiles ( display_name, avatar_path ) ),
          messages ( body, sent_at, sender_id )
        `)
        .in("id", convIds);

      dbThreads = (conversations ?? []).map((c: any): ChatThread => {
        const otherMembers = (c.conversation_members || []).filter((m: any) => m.profile_id !== userId);
        const otherUser = otherMembers[0]?.profiles;

        const msgs = (c.messages || []) as any[];
        const lastMsg = msgs.length > 0 ? [...msgs].sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0] : null;

        const timeStr = lastMsg
          ? new Date(lastMsg.sent_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
          : "12:00";

        return {
          id: String(c.id),
          name: c.type === "direct" && otherUser ? otherUser.display_name : "Общий чат группы",
          type: c.type === "direct" ? "roommate" : c.type === "owner_group" ? "owner" : "group",
          avatar: otherUser?.avatar_path || "/demo/people/maria.jpg",
          sublabel: c.type === "direct" ? "Сожитель" : "Чат группы сожителей",
          propertyId: c.property_id ? String(c.property_id) : undefined,
          lastMessage: lastMsg?.body ?? "Диалог открыт",
          lastMessageTime: timeStr,
          unreadCount: 0,
          isPinned: (pinnedByConversation.get(c.id) as boolean) ?? false,
        };
      });
    }

    const aiAssistantThread: ChatThread = {
      id: "ai-assistant",
      name: "Соседи AI 🤖",
      type: "ai_assistant",
      avatar: "/demo/people/zhenya.jpg",
      sublabel: "Помощник по совместной аренде",
      lastMessage: "Здравствуйте! Чем я могу помочь по жилью или сожителям?",
      lastMessageTime: "Только что",
      unreadCount: 0,
      isOnline: true,
      isPinned: true,
    };

    return [aiAssistantThread, ...dbThreads].sort((left, right) => Number(right.isPinned) - Number(left.isPinned));
  }

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const supabase = await createClient();
    const userId = await this.getUserId();

    if (threadId === "ai-assistant") {
      if (!userId) return [];
      const convId = await this.getOrCreateAiConversationId(supabase, userId);
      const { data: aiMsgs } = await supabase
        .from("ai_messages")
        .select("id, role, body, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (!aiMsgs || aiMsgs.length === 0) {
        return [
          {
            id: "ai-init-1",
            senderId: "ai-assistant",
            senderName: "Соседи AI",
            senderAvatar: "/demo/people/zhenya.jpg",
            content: "Здравствуйте! Я — AI-ассистент платформы «Соседи». Помогу рассчитать бюджет, составить правила проживания, оценить совместимость сожителей или подготовить заявку собственнику.",
            timestamp: "Только что",
            type: "ai_bot",
            isRead: true,
          },
        ];
      }

      return aiMsgs.map((m: any) => ({
        id: String(m.id),
        senderId: m.role === "user" ? "user" : "ai-assistant",
        senderName: m.role === "user" ? "Вы" : "Соседи AI",
        senderAvatar: m.role === "user" ? "/demo/people/maria.jpg" : "/demo/people/zhenya.jpg",
        content: m.body,
        timestamp: new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        type: m.role === "user" ? "text" : "ai_bot",
        isRead: true,
      }));
    }

    const { data: msgs, error } = await supabase
      .from("messages")
      .select(`
        id, sender_id, body, system_type, sent_at,
        profiles ( display_name, avatar_path )
      `)
      .eq("conversation_id", threadId)
      .is("deleted_at", null)
      .order("sent_at", { ascending: true });

    if (error || !msgs) return [];

    const messageIds = msgs.map((message: any) => message.id);
    const { data: reactionRows } = messageIds.length
      ? await supabase
          .from("message_reactions")
          .select("message_id, profile_id, emoji")
          .in("message_id", messageIds)
      : { data: [] };

    const reactionsByMessage = new Map<string, { counts: Record<string, number>; user: string[] }>();
    for (const reaction of reactionRows ?? []) {
      const current = reactionsByMessage.get(reaction.message_id) ?? { counts: {}, user: [] };
      current.counts[reaction.emoji] = (current.counts[reaction.emoji] ?? 0) + 1;
      if (reaction.profile_id === userId) current.user.push(reaction.emoji);
      reactionsByMessage.set(reaction.message_id, current);
    }

    return msgs.map((m: any): ChatMessage => {
      const timeStr = new Date(m.sent_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

      let parsedBody: any = null;
      if (m.body.startsWith("{") && m.body.endsWith("}")) {
        try {
          parsedBody = JSON.parse(m.body);
        } catch {
          // Keep as plain text
        }
      }

      return {
        id: String(m.id),
        senderId: m.sender_id || "system",
        senderName: m.profiles?.display_name ?? "Участник",
        senderAvatar: m.profiles?.avatar_path ?? "/demo/people/maria.jpg",
        content: parsedBody ? parsedBody.content : m.body,
        timestamp: timeStr,
        type: (m.system_type as ChatMessageType) ?? "text",
        pollData: parsedBody?.pollData ?? undefined,
        expenseData: parsedBody?.expenseData ?? undefined,
        viewingData: parsedBody?.viewingData ?? undefined,
        reactions: reactionsByMessage.get(m.id)?.counts ?? {},
        userReactions: reactionsByMessage.get(m.id)?.user ?? [],
      };
    });
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
      senderId?: string;
      senderName?: string;
      senderAvatar?: string;
      attachments?: any[];
      clientGeneratedId?: string;
    }
  ): Promise<ChatMessage> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    if (threadId === "ai-assistant") {
      const convId = await this.getOrCreateAiConversationId(supabase, userId);
      const isBot = extraData?.senderId === "ai-assistant" || type === "ai_bot";
      const role: "user" | "assistant" = isBot ? "assistant" : "user";

      const { data: inserted, error } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: convId,
          role,
          body: content,
        })
        .select("id, created_at")
        .single();

      if (error || !inserted) throw new Error("Не удалось сохранить сообщение ИИ-чата.");

      const timeStr = new Date(inserted.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

      return {
        id: inserted.id,
        senderId: isBot ? "ai-assistant" : "user",
        senderName: isBot ? "Соседи AI" : (extraData?.senderName || "Вы"),
        senderAvatar: isBot ? "/demo/people/zhenya.jpg" : (extraData?.senderAvatar || "/demo/people/maria.jpg"),
        content,
        timestamp: timeStr,
        type: isBot ? "ai_bot" : "text",
        isRead: true,
      };
    }

    const payload = extraData ? { content, ...extraData } : content;
    const bodyText = typeof payload === "string" ? payload : JSON.stringify(payload);

    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: threadId,
        sender_id: userId,
        body: bodyText,
        system_type: type,
      })
      .select(`
        id, sender_id, body, system_type, sent_at,
        profiles ( display_name, avatar_path )
      `)
      .single();

    if (error || !msg) throw new Error("Не удалось отправить сообщение.");

    const timeStr = new Date(msg.sent_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

    return {
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.profiles?.display_name ?? "Вы",
      senderAvatar: msg.profiles?.avatar_path ?? "/demo/people/maria.jpg",
      content,
      timestamp: timeStr,
      type: type,
      pollData: extraData?.pollData ?? undefined,
      expenseData: extraData?.expenseData ?? undefined,
      viewingData: extraData?.viewingData ?? undefined,
    };
  }

  async markThreadAsRead(threadId: string): Promise<void> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) return;

    await supabase
      .from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", threadId)
      .eq("profile_id", userId);
  }

  async voteInPoll(threadId: string, messageId: string, optionId: string): Promise<ChatMessage> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    const { data: msg } = await supabase
      .from("messages")
      .select("body, system_type")
      .eq("id", messageId)
      .single();

    if (msg && msg.body.startsWith("{")) {
      const parsed = JSON.parse(msg.body);
      if (parsed.pollData) {
        parsed.pollData.options.forEach((opt: any) => {
          const uidx = opt.voterIds.indexOf(userId);
          if (opt.id === optionId) {
            if (uidx < 0) opt.voterIds.push(userId);
          } else {
            if (uidx >= 0) opt.voterIds.splice(uidx, 1);
          }
        });
        parsed.pollData.totalVotes = parsed.pollData.options.reduce((acc: number, o: any) => acc + o.voterIds.length, 0);

        await supabase
          .from("messages")
          .update({ body: JSON.stringify(parsed) })
          .eq("id", messageId);
      }
    }

    const messages = await this.getMessages(threadId);
    return messages.find((m) => m.id === messageId) ?? messages[0];
  }

  async updateViewingStatus(threadId: string, messageId: string, status: ViewingBooking["status"]): Promise<ChatMessage> {
    const supabase = await createClient();
    const { data: msg } = await supabase
      .from("messages")
      .select("body")
      .eq("id", messageId)
      .single();

    if (msg && msg.body.startsWith("{")) {
      const parsed = JSON.parse(msg.body);
      if (parsed.viewingData) {
        parsed.viewingData.status = status;
        await supabase
          .from("messages")
          .update({ body: JSON.stringify(parsed) })
          .eq("id", messageId);
      }
    }

    const messages = await this.getMessages(threadId);
    return messages.find((m) => m.id === messageId) ?? messages[0];
  }

  async toggleExpensePaid(threadId: string, messageId: string, memberId: string): Promise<ChatMessage> {
    const supabase = await createClient();
    const { data: msg } = await supabase
      .from("messages")
      .select("body")
      .eq("id", messageId)
      .single();

    if (msg && msg.body.startsWith("{")) {
      const parsed = JSON.parse(msg.body);
      if (parsed.expenseData) {
        const share = parsed.expenseData.shares.find((s: any) => s.memberId === memberId);
        if (share) share.isPaid = !share.isPaid;
        await supabase
          .from("messages")
          .update({ body: JSON.stringify(parsed) })
          .eq("id", messageId);
      }
    }

    const messages = await this.getMessages(threadId);
    return messages.find((m) => m.id === messageId) ?? messages[0];
  }

  async togglePinThread(threadId: string): Promise<ChatThread[]> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    const { data: membership, error: readError } = await supabase
      .from("conversation_members")
      .select("is_pinned")
      .eq("conversation_id", threadId)
      .eq("profile_id", userId)
      .single();

    if (readError || !membership) throw new Error("Диалог не найден.");

    const { error } = await supabase
      .from("conversation_members")
      .update({ is_pinned: !membership.is_pinned })
      .eq("conversation_id", threadId)
      .eq("profile_id", userId);

    if (error) throw new Error("Не удалось закрепить диалог.");
    return this.getChatThreads();
  }

  async toggleMessageReaction(threadId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    const supabase = await createClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

    const { data: existing, error: readError } = await supabase
      .from("message_reactions")
      .select("message_id")
      .eq("message_id", messageId)
      .eq("profile_id", userId)
      .eq("emoji", emoji)
      .maybeSingle();

    if (readError) throw new Error("Не удалось загрузить реакции.");

    const operation = existing
      ? supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("profile_id", userId)
          .eq("emoji", emoji)
      : supabase.from("message_reactions").insert({ message_id: messageId, profile_id: userId, emoji });
    const { error } = await operation;
    if (error) throw new Error("Не удалось обновить реакцию.");

    const messages = await this.getMessages(threadId);
    const message = messages.find((item) => item.id === messageId);
    if (!message) throw new Error("Сообщение не найдено.");
    return message;
  }

  async listChores(): Promise<DemoChore[]> {
    const supabase = await createClient();
    const context = await this.getActiveGroupContext();
    const { data, error } = await supabase
      .from("chores")
      .select("id, title, assignee_id, due_at, status")
      .eq("group_id", context.groupId)
      .order("created_at", { ascending: false });

    if (error) throw new Error("Не удалось загрузить задачи.");
    const names = new Map(context.members.map((member) => [member.id, member.name]));

    return (data ?? []).map((chore: any) => ({
      id: chore.id,
      title: chore.title,
      assigneeId: chore.assignee_id === context.userId ? "anna" : (chore.assignee_id ?? ""),
      assigneeName: chore.assignee_id ? (names.get(chore.assignee_id) ?? "Сожитель") : "Не назначено",
      isDone: chore.status === "done",
      dueDate: chore.due_at
        ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(chore.due_at))
        : "без срока",
    }));
  }

  async createChore(title: string, assigneeId: string, dueDate: string): Promise<DemoChore[]> {
    const supabase = await createClient();
    const context = await this.getActiveGroupContext();
    const resolvedAssigneeId = this.resolveMemberId(assigneeId, context);
    const parsedDueDate = Date.parse(dueDate);

    const { error } = await supabase.from("chores").insert({
      group_id: context.groupId,
      created_by: context.userId,
      assignee_id: resolvedAssigneeId,
      title: title.trim(),
      due_at: Number.isNaN(parsedDueDate) ? null : new Date(parsedDueDate).toISOString(),
      status: "open",
    });

    if (error) throw new Error("Не удалось создать задачу.");
    return this.listChores();
  }

  async toggleChoreDone(id: string): Promise<DemoChore[]> {
    const supabase = await createClient();
    const context = await this.getActiveGroupContext();
    const { data: chore, error: readError } = await supabase
      .from("chores")
      .select("status")
      .eq("id", id)
      .eq("group_id", context.groupId)
      .single();

    if (readError || !chore) throw new Error("Задача не найдена.");
    const nextStatus = chore.status === "done" ? "open" : "done";
    const { error } = await supabase
      .from("chores")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("group_id", context.groupId);

    if (error) throw new Error("Не удалось обновить задачу.");
    return this.listChores();
  }

  async listExpenses(): Promise<ExpenseSplit[]> {
    const supabase = await createClient();
    const context = await this.getActiveGroupContext();
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("id, description, amount, created_at")
      .eq("group_id", context.groupId)
      .order("created_at", { ascending: false });

    if (error) throw new Error("Не удалось загрузить расходы.");
    const expenseIds = (expenses ?? []).map((expense: any) => expense.id);
    const { data: shareRows, error: sharesError } = expenseIds.length
      ? await supabase
          .from("expense_members")
          .select("expense_id, profile_id, share, paid_at")
          .in("expense_id", expenseIds)
      : { data: [], error: null };

    if (sharesError) throw new Error("Не удалось загрузить доли расходов.");
    const names = new Map(context.members.map((member) => [member.id, member.name]));

    return (expenses ?? []).map((expense: any) => ({
      id: expense.id,
      title: expense.description,
      totalAmount: expense.amount,
      shares: (shareRows ?? [])
        .filter((share: any) => share.expense_id === expense.id)
        .map((share: any) => ({
          memberId: share.profile_id === context.userId ? "anna" : share.profile_id,
          memberName: names.get(share.profile_id) ?? "Сожитель",
          amount: share.share,
          isPaid: Boolean(share.paid_at),
        })),
    }));
  }

  async createExpense(title: string, totalAmount: number, shares: ExpenseShare[]): Promise<ExpenseSplit[]> {
    const supabase = await createClient();
    const context = await this.getActiveGroupContext();
    const amount = Math.round(totalAmount);
    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        group_id: context.groupId,
        created_by: context.userId,
        category: "household",
        description: title.trim(),
        amount,
      })
      .select("id")
      .single();

    if (error || !expense) throw new Error("Не удалось создать расход.");

    const resolvedShares = new Map<string, { share: number; paidAt: string | null }>();
    for (const share of shares) {
      const profileId = this.resolveMemberId(share.memberId, context);
      resolvedShares.set(profileId, {
        share: Math.max(0, Math.round(share.amount)),
        paidAt: share.isPaid ? new Date().toISOString() : null,
      });
    }

    if (resolvedShares.size === 0) {
      const defaultShare = Math.round(amount / Math.max(context.members.length, 1));
      for (const member of context.members) {
        resolvedShares.set(member.id, { share: defaultShare, paidAt: null });
      }
    }

    const { error: shareError } = await supabase.from("expense_members").insert(
      Array.from(resolvedShares, ([profileId, value]) => ({
        expense_id: expense.id,
        profile_id: profileId,
        share: value.share,
        paid_at: value.paidAt,
      })),
    );

    if (shareError) {
      await supabase.from("expenses").delete().eq("id", expense.id);
      throw new Error("Не удалось распределить расход между участниками.");
    }

    return this.listExpenses();
  }

  async toggleGlobalExpensePaid(expenseId: string, memberId: string): Promise<ExpenseSplit[]> {
    const supabase = await createClient();
    const context = await this.getActiveGroupContext();
    const profileId = this.resolveMemberId(memberId, context);
    const { data: share, error: readError } = await supabase
      .from("expense_members")
      .select("paid_at")
      .eq("expense_id", expenseId)
      .eq("profile_id", profileId)
      .single();

    if (readError || !share) throw new Error("Доля расхода не найдена.");
    const { error } = await supabase
      .from("expense_members")
      .update({ paid_at: share.paid_at ? null : new Date().toISOString() })
      .eq("expense_id", expenseId)
      .eq("profile_id", profileId);

    if (error) throw new Error("Не удалось обновить оплату.");
    return this.listExpenses();
  }
}
