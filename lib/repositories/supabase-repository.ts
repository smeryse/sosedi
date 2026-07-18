import type { DemoProperty, DemoRoommate } from "@/data/demo";
import { getSupabaseClient } from "./index";
import { compatibilityScore, propertyGroupCompatibility } from "@/lib/compatibility/engine";
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
  Repository,
  ViewingBooking,
} from "./types";

function mapProfileToCompatibility(profile: any, pref: any): CompatibilityProfile {
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

export class SupabaseRepository implements Repository {
  private async getUserId(): Promise<string | null> {
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  }

  private async ensureProfileExists(userId: string) {
    const supabase = await getSupabaseClient();
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

  async listRoommates(query = "") {
    const supabase = await getSupabaseClient();
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
      request = request.ne("id", currentUserId);
    }

    const { data: profiles, error } = await request.limit(50);
    if (error) throw new Error("Не удалось загрузить каталог соседей.");

    // Fetch current user preference to calculate compatibility
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

  async listProperties(query = "") {
    const supabase = await getSupabaseClient();
    const { data: properties, error } = await supabase
      .from("properties")
      .select(`
        id, title, description, district, address, monthly_rent, rooms, area, floor, total_floors,
        property_images ( storage_path )
      `)
      .eq("status", "published")
      .is("archived_at", null)
      .limit(50);

    if (error) throw new Error("Не удалось загрузить каталог жилья.");

    const mapped: DemoProperty[] = (properties ?? []).map((prop: any) => {
      const photos = prop.property_images ?? [];
      const imagePath = photos.length > 0 ? photos[0].storage_path : "/demo/properties/center-loft.jpg";
      return {
        id: prop.id,
        title: prop.title,
        address: prop.address ?? `Краснодар, ${prop.district}`,
        district: prop.district,
        price: prop.monthly_rent,
        rooms: prop.rooms,
        area: Number(prop.area),
        floor: prop.floor ? `${prop.floor}/${prop.total_floors ?? 9}` : "5/12",
        image: imagePath,
        match: 86,
        photosCount: photos.length > 0 ? photos.length : 8,
        tags: ["Проверенное жильё", "Мебель", "Техника"],
      };
    });

    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? mapped.filter((p) =>
          p.title.toLowerCase().includes(normalizedQuery) ||
          p.district.toLowerCase().includes(normalizedQuery) ||
          p.address.toLowerCase().includes(normalizedQuery)
        )
      : mapped;
  }

  async getState(): Promise<DemoState> {
    const supabase = await getSupabaseClient();
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
      id: f.target_id,
    }));

    // 2. Answers
    const { data: ans } = await supabase
      .from("lifestyle_answers")
      .select("question_key, answer, importance")
      .eq("profile_id", userId);

    const answers = (ans ?? []).map((a: any) => ({
      questionKey: a.question_key,
      answer: String(a.answer),
      importance: a.importance,
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
          .select("profile_id")
          .eq("group_id", g.id)
          .eq("status", "active");

        group = {
          id: g.id,
          name: g.name,
          status: g.status as any,
          memberIds: (members ?? []).map((m: any) => m.profile_id),
          targetBudget: g.target_budget ?? 90000,
          moveInDate: g.move_in_date ?? "",
          compatibility: 89,
        };

        // 4. Applications
        const { data: apps } = await supabase
          .from("applications")
          .select("id, property_id, group_id, status, created_at")
          .eq("group_id", g.id);

        applications = (apps ?? []).map((a: any) => ({
          id: a.id,
          propertyId: a.property_id,
          groupId: a.group_id,
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

    return {
      favorites,
      group,
      applications,
      answers,
      threads,
      messages,
      chores: [],
      expenses: [],
    };
  }

  async toggleFavorite(type: "profile" | "property", id: string): Promise<DemoState> {
    const supabase = await getSupabaseClient();
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
    const supabase = await getSupabaseClient();
    const userId = await this.getUserId();
    if (!userId) return this.getState();

    await this.ensureProfileExists(userId);

    // Save answer
    await supabase
      .from("lifestyle_answers")
      .upsert({
        profile_id: userId,
        question_key: answer.questionKey,
        answer: answer.answer,
        importance: answer.importance,
      }, { onConflict: "profile_id, question_key" });

    // Sync to profiles / profile_preferences
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
    const supabase = await getSupabaseClient();
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

  async submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId">): Promise<DemoApplication> {
    const supabase = await getSupabaseClient();
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
      })
      .select("id, property_id, group_id, status, created_at")
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
      status: app.status as any,
      createdAt: app.created_at,
    };
  }

  async getChatThreads(): Promise<ChatThread[]> {
    const supabase = await getSupabaseClient();
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data: memberships } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("profile_id", userId);

    const convIds = (memberships ?? []).map((m: any) => m.conversation_id);
    if (convIds.length === 0) return [];

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id, type, property_id,
        conversation_members ( profile_id, profiles ( display_name, avatar_path ) ),
        messages ( body, sent_at, sender_id )
      `)
      .in("id", convIds);

    if (error) return [];

    return (conversations ?? []).map((c: any): ChatThread => {
      const otherMembers = c.conversation_members.filter((m: any) => m.profile_id !== userId);
      const otherUser = otherMembers[0]?.profiles;

      const msgs = c.messages ?? [];
      const lastMsg = msgs.length > 0 ? msgs.sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0] : null;

      const timeStr = lastMsg
        ? new Date(lastMsg.sent_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
        : "12:00";

      return {
        id: c.id,
        name: c.type === "direct" && otherUser ? otherUser.display_name : "Общий чат группы",
        type: c.type === "direct" ? "roommate" : c.type === "owner_group" ? "owner" : "group",
        avatar: otherUser?.avatar_path || "/demo/people/maria.jpg",
        sublabel: c.type === "direct" ? "Сожитель" : "Чат группы сожителей",
        propertyId: c.property_id ?? undefined,
        lastMessage: lastMsg?.body ?? "Диалог открыт",
        lastMessageTime: timeStr,
        unreadCount: 0,
      };
    });
  }

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const supabase = await getSupabaseClient();
    const { data: msgs, error } = await supabase
      .from("messages")
      .select(`
        id, sender_id, body, system_type, sent_at,
        profiles ( display_name, avatar_path )
      `)
      .eq("conversation_id", threadId)
      .is("deleted_at", null)
      .order("sent_at", { ascending: true });

    if (error) return [];

    return (msgs ?? []).map((m: any): ChatMessage => {
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
        id: m.id,
        senderId: m.sender_id,
        senderName: m.profiles?.display_name ?? "Участник",
        senderAvatar: m.profiles?.avatar_path ?? "/demo/people/maria.jpg",
        content: parsedBody ? parsedBody.content : m.body,
        timestamp: timeStr,
        type: (m.system_type as ChatMessageType) ?? "text",
        pollData: parsedBody?.pollData ?? undefined,
        expenseData: parsedBody?.expenseData ?? undefined,
        viewingData: parsedBody?.viewingData ?? undefined,
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
    }
  ): Promise<ChatMessage> {
    const supabase = await getSupabaseClient();
    const userId = await this.getUserId();
    if (!userId) throw new Error("Не авторизован");

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
    const supabase = await getSupabaseClient();
    const userId = await this.getUserId();
    if (!userId) return;

    await supabase
      .from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", threadId)
      .eq("profile_id", userId);
  }

  async voteInPoll(threadId: string, messageId: string, optionId: string): Promise<ChatMessage> {
    const supabase = await getSupabaseClient();
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
    const supabase = await getSupabaseClient();
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
    const supabase = await getSupabaseClient();
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _t = threadId;
    return this.getChatThreads();
  }

  async toggleMessageReaction(threadId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _e = emoji;
    const messages = await this.getMessages(threadId);
    return messages.find((m) => m.id === messageId) ?? messages[0];
  }

  async listChores(): Promise<DemoChore[]> {
    return [];
  }

  async createChore(title: string, assigneeId: string, dueDate: string): Promise<DemoChore[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _d = [title, assigneeId, dueDate];
    return [];
  }

  async toggleChoreDone(id: string): Promise<DemoChore[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _i = id;
    return [];
  }

  async listExpenses(): Promise<ExpenseSplit[]> {
    return [];
  }

  async createExpense(title: string, totalAmount: number, shares: ExpenseShare[]): Promise<ExpenseSplit[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _d = [title, totalAmount, shares];
    return [];
  }

  async toggleGlobalExpensePaid(expenseId: string, memberId: string): Promise<ExpenseSplit[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _d = [expenseId, memberId];
    return [];
  }
}
