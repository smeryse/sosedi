import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnvFile(filePath: string) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // ignore
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("your-project-url")) {
  console.warn("⚠️ Warning: Supabase credentials or SUPABASE_SERVICE_ROLE_KEY missing. Seed script running in dry-run mode or with fallback.");
}

const supabase = createClient(
  supabaseUrl && !supabaseUrl.includes("your-project-url") ? supabaseUrl : "https://dummy-project.supabase.co",
  serviceRoleKey || "dummy-service-role-key",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const DEMO_USERS_CONFIG = [
  {
    seedKey: "profile-anna",
    email: process.env.DEMO_ANNA_EMAIL || "anna.demo@sosedi.local",
    password: process.env.DEMO_ANNA_PASSWORD || process.env.DEMO_USER_PASSWORD || "DemoSosedi2026!",
    displayName: "Анна",
    role: "tenant",
    age: 25,
    jobTitle: "Product Designer",
    avatarPath: "/demo/people/anna.jpg",
    budgetMax: 35000,
    city: "Краснодар",
  },
  {
    seedKey: "profile-zhenya",
    email: process.env.DEMO_ZHENYA_EMAIL || "zhenya.demo@sosedi.local",
    password: process.env.DEMO_ZHENYA_PASSWORD || process.env.DEMO_USER_PASSWORD || "DemoSosedi2026!",
    displayName: "Женя",
    role: "tenant",
    age: 27,
    jobTitle: "Помощник по правилам и договору",
    avatarPath: "/demo/people/zhenya.jpg",
    budgetMax: 30000,
    city: "Краснодар",
  },
  {
    seedKey: "profile-maria",
    email: process.env.DEMO_MARIA_EMAIL || "maria.demo@sosedi.local",
    password: process.env.DEMO_MARIA_PASSWORD || process.env.DEMO_USER_PASSWORD || "DemoSosedi2026!",
    displayName: "Мария",
    role: "tenant",
    age: 24,
    jobTitle: "Маркетолог",
    avatarPath: "/demo/people/maria.jpg",
    budgetMax: 25000,
    city: "Краснодар",
  },
  {
    seedKey: "profile-artem",
    email: process.env.DEMO_ARTEM_EMAIL || "artem.demo@sosedi.local",
    password: process.env.DEMO_ARTEM_PASSWORD || process.env.DEMO_USER_PASSWORD || "DemoSosedi2026!",
    displayName: "Артём",
    role: "tenant",
    age: 27,
    jobTitle: "Разработчик",
    avatarPath: "/demo/people/artem.jpg",
    budgetMax: 28000,
    city: "Краснодар",
  },
  {
    seedKey: "profile-ekaterina",
    email: process.env.DEMO_EKATERINA_EMAIL || "ekaterina.demo@sosedi.local",
    password: process.env.DEMO_EKATERINA_PASSWORD || process.env.DEMO_USER_PASSWORD || "DemoSosedi2026!",
    displayName: "Екатерина",
    role: "tenant",
    age: 26,
    jobTitle: "Дизайнер",
    avatarPath: "/demo/people/ekaterina.jpg",
    budgetMax: 30000,
    city: "Краснодар",
  },
  {
    seedKey: "profile-owner",
    email: process.env.DEMO_OWNER_EMAIL || "owner.demo@sosedi.local",
    password: process.env.DEMO_OWNER_PASSWORD || process.env.DEMO_USER_PASSWORD || "DemoSosedi2026!",
    displayName: "Собственник (АРЕАТОР)",
    role: "landlord",
    age: 42,
    jobTitle: "Собственник жилья",
    avatarPath: "/demo/people/owner.jpg",
    budgetMax: 0,
    city: "Краснодар",
  },
];

export async function seedDemoAccounts() {
  console.log("🚀 Starting idempotent seed of demo accounts & scenario data...");

  if (!serviceRoleKey || !supabaseUrl || supabaseUrl.includes("your-project-url")) {
    console.log("ℹ️ Skipping live Supabase requests because service role key or URL is not configured.");
    return { success: false, reason: "No valid Supabase credentials provided." };
  }

  const userIds: Record<string, string> = {};

  // 1. Create or update Auth users
  for (const cfg of DEMO_USERS_CONFIG) {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === cfg.email);

    let uid = "";
    if (existing) {
      uid = existing.id;
      await supabase.auth.admin.updateUserById(uid, {
        password: cfg.password,
        email_confirm: true,
        user_metadata: { display_name: cfg.displayName, is_demo: true, seed_key: cfg.seedKey },
      });
      console.log(`✓ Updated existing demo auth user: ${cfg.displayName} (${cfg.email}) -> ${uid.slice(0, 8)}...`);
    } else {
      const { data: createData, error } = await supabase.auth.admin.createUser({
        email: cfg.email,
        password: cfg.password,
        email_confirm: true,
        user_metadata: { display_name: cfg.displayName, is_demo: true, seed_key: cfg.seedKey },
      });
      if (error || !createData.user) {
        console.error(`❌ Error creating user ${cfg.email}:`, error?.message);
        continue;
      }
      uid = createData.user.id;
      console.log(`+ Created demo auth user: ${cfg.displayName} (${cfg.email}) -> ${uid.slice(0, 8)}...`);
    }
    userIds[cfg.seedKey] = uid;

    // Profiles
    await supabase.from("profiles").upsert(
      {
        id: uid,
        display_name: cfg.displayName,
        avatar_path: cfg.avatarPath,
        age: cfg.age,
        job_title: cfg.jobTitle,
        city: cfg.city,
        budget_max: cfg.budgetMax,
        is_public: true,
        is_demo: true,
        seed_key: cfg.seedKey,
      },
      { onConflict: "id" }
    );

    // Roles
    await supabase.from("user_roles").upsert(
      { user_id: uid, role: cfg.role },
      { onConflict: "user_id,role" }
    );

    // Profile Preferences
    await supabase.from("profile_preferences").upsert(
      {
        profile_id: uid,
        city: cfg.city,
        districts: ["Центральный район", "Фестивальный"],
        min_budget: 15000,
        max_budget: cfg.budgetMax || 40000,
      },
      { onConflict: "profile_id" }
    );

    // Lifestyle Answers
    const answers = [
      { question_key: "sleep", answer: cfg.seedKey === "profile-artem" ? "Поздно" : "Рано", importance: 3 },
      { question_key: "smoking", answer: "Не курю", importance: 5 },
      { question_key: "pets", answer: cfg.seedKey === "profile-maria" ? "Кошка" : "Без животных", importance: 4 },
      { question_key: "cleanliness", answer: "Идеально чисто", importance: 4 },
    ];

    for (const a of answers) {
      await supabase.from("lifestyle_answers").upsert(
        { profile_id: uid, question_key: a.question_key, answer: a.answer, importance: a.importance },
        { onConflict: "profile_id,question_key" }
      );
    }
  }

  const annaId = userIds["profile-anna"];
  const zhenyaId = userIds["profile-zhenya"];
  const mariaId = userIds["profile-maria"];
  const artemId = userIds["profile-artem"];
  const ekaterinaId = userIds["profile-ekaterina"];
  const ownerId = userIds["profile-owner"];

  if (!annaId || !ownerId) {
    console.error("❌ Required users (Anna or Owner) could not be initialized.");
    return { success: false, reason: "Required demo users missing." };
  }

  // 2. Property: ул. Северная, д. 426
  let { data: propertyRow } = await supabase
    .from("properties")
    .select("id")
    .eq("seed_key", "property-center-loft")
    .maybeSingle();

  if (!propertyRow) {
    const { data: insertedProp, error: propErr } = await supabase
      .from("properties")
      .insert({
        owner_id: ownerId,
        title: "1-комн. квартира, 35 м² — ул. Северная, д. 426",
        address: "ул. Северная, д. 426",
        city: "Краснодар",
        district: "Центральный район",
        monthly_rent: 25000,
        deposit_amount: 25000,
        rooms: 1,
        rooms_count: 1,
        area: 35,
        floor: 2,
        total_floors: 9,
        description: "Уютная светлая однокомнатная квартира в самом центре города. Есть всё необходимое для комфортного проживания.",
        status: "published",
        is_available: true,
        is_demo: true,
        seed_key: "property-center-loft",
      })
      .select("id")
      .single();

    if (propErr) console.error("Error creating property:", propErr.message);
    propertyRow = insertedProp;
  }
  const propertyId = propertyRow?.id;

  if (propertyId) {
    await supabase.from("property_images").upsert(
      { property_id: propertyId, storage_path: "/demo/properties/center-loft.jpg", is_main: true },
      { onConflict: "id" }
    );
  }

  // 3. Group: «Квартира в центре»
  let { data: groupRow } = await supabase
    .from("groups")
    .select("id")
    .eq("seed_key", "group-center-flat")
    .maybeSingle();

  if (!groupRow) {
    const { data: insertedGrp, error: grpErr } = await supabase
      .from("groups")
      .insert({
        name: "Квартира в центре",
        target_budget: 90000,
        status: "forming",
        created_by: annaId,
        is_demo: true,
        seed_key: "group-center-flat",
      })
      .select("id")
      .single();

    if (grpErr) console.error("Error creating group:", grpErr.message);
    groupRow = insertedGrp;
  }
  const groupId = groupRow?.id;

  if (groupId) {
    const members = [
      { profile_id: annaId, role: "admin" },
      { profile_id: mariaId, role: "member" },
      { profile_id: artemId, role: "member" },
      { profile_id: ekaterinaId, role: "member" },
    ];
    for (const m of members) {
      await supabase.from("group_members").upsert(
        { group_id: groupId, profile_id: m.profile_id, role: m.role, status: "active" },
        { onConflict: "group_id,profile_id" }
      );
    }
  }

  // 4. Viewing Request (Application) for Property Center Loft
  let { data: appRow } = await supabase
    .from("applications")
    .select("id")
    .eq("seed_key", "app-center-loft")
    .maybeSingle();

  if (!appRow && propertyId && groupId) {
    const { data: insertedApp, error: appErr } = await supabase
      .from("applications")
      .insert({
        group_id: groupId,
        property_id: propertyId,
        created_by: annaId,
        status: "pending",
        total_budget: 25000,
        tenant_message: "Здравствуйте! Наша группа готова посмотреть вашу квартиру на ул. Северная.",
        viewing_date: "2026-07-24",
        viewing_time_slot: "18:30",
        is_demo: true,
        seed_key: "app-center-loft",
      })
      .select("id")
      .single();

    if (appErr) console.error("Error creating application:", appErr.message);
    appRow = insertedApp;
  }
  const applicationId = appRow?.id;

  // 5. Conversations (4 Chat Threads)
  const conversationConfigs = [
    {
      seedKey: "chat-zhenya",
      type: "direct",
      propertyId: null,
      applicationId: null,
      members: [annaId, zhenyaId],
    },
    {
      seedKey: "chat-maria",
      type: "direct",
      propertyId: null,
      applicationId: null,
      members: [annaId, mariaId],
    },
    {
      seedKey: "chat-group",
      type: "group",
      propertyId: propertyId || null,
      applicationId: null,
      groupId: groupId || null,
      members: [annaId, mariaId, artemId, ekaterinaId],
    },
    {
      seedKey: "chat-owner",
      type: "owner_group",
      propertyId: propertyId || null,
      applicationId: applicationId || null,
      members: [annaId, ownerId],
    },
  ];

  const convIds: Record<string, string> = {};

  for (const ccfg of conversationConfigs) {
    let { data: convRow } = await supabase
      .from("conversations")
      .select("id")
      .eq("seed_key", ccfg.seedKey)
      .maybeSingle();

    if (!convRow) {
      const { data: insertedConv, error: cErr } = await supabase
        .from("conversations")
        .insert({
          type: ccfg.type,
          property_id: ccfg.propertyId,
          application_id: ccfg.applicationId,
          created_by: annaId,
          is_demo: true,
          seed_key: ccfg.seedKey,
        })
        .select("id")
        .single();

      if (cErr) console.error(`Error creating conversation ${ccfg.seedKey}:`, cErr.message);
      convRow = insertedConv;
    }

    if (convRow) {
      convIds[ccfg.seedKey] = convRow.id;
      for (const memId of ccfg.members) {
        if (!memId) continue;
        const lastReadAt = ccfg.seedKey === "chat-maria" && memId === annaId
          ? new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago so 2 newest messages are unread
          : new Date().toISOString();

        await supabase.from("conversation_members").upsert(
          {
            conversation_id: convRow.id,
            profile_id: memId,
            is_pinned: ccfg.seedKey === "chat-zhenya",
            last_read_at: lastReadAt,
          },
          { onConflict: "conversation_id,profile_id" }
        );
      }
    }
  }

  // 6. Populate Realistic Cohesive Messages (8-15 messages per thread)
  const now = Date.now();
  const minute = 60 * 1000;
  const hour = 60 * minute;

  const messagesScenario: Array<{
    convSeedKey: string;
    senderId: string;
    body: string;
    systemType: string;
    sentAtOffset: number; // ms before now
    seedKey: string;
  }> = [
    // --- Chat Zhenya ---
    { convSeedKey: "chat-zhenya", senderId: zhenyaId, body: "Здравствуйте! Чем я могу помочь по подбору жилья или оформлению договора?", systemType: "text", sentAtOffset: 12 * hour, seedKey: "msg-zh-1" },
    { convSeedKey: "chat-zhenya", senderId: annaId, body: "Привет, Женя! Подскажи, какие ключевые условия стоит обязательно прописать в соглашении сожителей?", systemType: "text", sentAtOffset: 11 * hour, seedKey: "msg-zh-2" },
    { convSeedKey: "chat-zhenya", senderId: zhenyaId, body: "Главные пункты — это график тишины, порядок оплаты коммунальных услуг и распределение бытовых обязанностей.", systemType: "text", sentAtOffset: 10 * hour, seedKey: "msg-zh-3" },
    { convSeedKey: "chat-zhenya", senderId: zhenyaId, body: "Также рекомендую сразу зафиксировать сумму залога и условия его возврата при досрочном съезде.", systemType: "text", sentAtOffset: 9 * hour, seedKey: "msg-zh-4" },
    { convSeedKey: "chat-zhenya", senderId: annaId, body: "Поняла, спасибо! А как быть с оплатой общего залога, если у нас в группе 4 человека?", systemType: "text", sentAtOffset: 8 * hour, seedKey: "msg-zh-5" },
    { convSeedKey: "chat-zhenya", senderId: zhenyaId, body: "Вы можете воспользоваться нашим инструментом 'Раздел расходов' прямо в чате или симулятором быта.", systemType: "text", sentAtOffset: 7 * hour, seedKey: "msg-zh-6" },
    { convSeedKey: "chat-zhenya", senderId: annaId, body: "Отличный инструмент, мы как раз обсуждаем варианты с Марией и Артёмом!", systemType: "text", sentAtOffset: 6 * hour, seedKey: "msg-zh-7" },
    { convSeedKey: "chat-zhenya", senderId: zhenyaId, body: "Супер! Если понадобятся образцы договора или консультация по проверке собственника — напишите мне в любое время 👍", systemType: "text", sentAtOffset: 5 * minute, seedKey: "msg-zh-8" },

    // --- Chat Maria ---
    { convSeedKey: "chat-maria", senderId: mariaId, body: "Анна, привет! Я посмотрела вариант квартиры на ул. Северная, очень достойный вариант!", systemType: "text", sentAtOffset: 5 * hour, seedKey: "msg-mar-1" },
    { convSeedKey: "chat-maria", senderId: annaId, body: "Привет, Мария! Да, мне тоже очень понравилась локация в Центральном районе.", systemType: "text", sentAtOffset: 4 * hour, seedKey: "msg-mar-2" },
    { convSeedKey: "chat-maria", senderId: mariaId, body: "И бюджет в 25 000 ₽ на группу выходит очень выгодным.", systemType: "text", sentAtOffset: 3 * hour, seedKey: "msg-mar-3" },
    { convSeedKey: "chat-maria", senderId: annaId, body: "Давай согласуем со всей группой время просмотра и отправим запрос собственнику.", systemType: "text", sentAtOffset: 2 * hour, seedKey: "msg-mar-4" },
    { convSeedKey: "chat-maria", senderId: mariaId, body: "Отличная идея! Можем запланировать просмотр на четверг в 18:30?", systemType: "text", sentAtOffset: 90 * minute, seedKey: "msg-mar-5" },
    { convSeedKey: "chat-maria", senderId: annaId, body: "Да, мне подходит это время. Сейчас как раз напишу собственнику.", systemType: "text", sentAtOffset: 60 * minute, seedKey: "msg-mar-6" },
    // 2 Unread messages for Anna below:
    { convSeedKey: "chat-maria", senderId: mariaId, body: "Давайте обсудим просмотр в четверг! Артём и Екатерина тоже подтвердили участие.", systemType: "text", sentAtOffset: 20 * minute, seedKey: "msg-mar-7" },
    { convSeedKey: "chat-maria", senderId: mariaId, body: "И ещё я заглянула в симулятор быта, тихие часы с 23:00 нас с кошкой вполне устраивают 😸", systemType: "text", sentAtOffset: 10 * minute, seedKey: "msg-mar-8" },

    // --- Chat Group «Квартира в центре» ---
    { convSeedKey: "chat-group", senderId: annaId, body: "Всем привет! Собрала нашу группу сожителей для аренды квартиры в центре.", systemType: "text", sentAtOffset: 24 * hour, seedKey: "msg-grp-1" },
    { convSeedKey: "chat-group", senderId: artemId, body: "Привет! Отлично, наш общий бюджет до 90 000 ₽ позволяет выбрать шикарный вариант.", systemType: "text", sentAtOffset: 22 * hour, seedKey: "msg-grp-2" },
    { convSeedKey: "chat-group", senderId: ekaterinaId, body: "Главное, чтобы в квартире было хорошее рабочее место, так как я работаю из дома.", systemType: "text", sentAtOffset: 20 * hour, seedKey: "msg-grp-3" },
    { convSeedKey: "chat-group", senderId: mariaId, body: "Вариант на ул. Северная, д. 426 идеален по логистике и качеству ремонта.", systemType: "text", sentAtOffset: 18 * hour, seedKey: "msg-grp-4" },
    { convSeedKey: "chat-group", senderId: annaId, body: "Запустила опрос по дате просмотра. Голосуем за 1-к квартиру!", systemType: "text", sentAtOffset: 15 * hour, seedKey: "msg-grp-5" },
    { convSeedKey: "chat-group", senderId: artemId, body: "Проголосовал! Я за четверг вечер.", systemType: "text", sentAtOffset: 12 * hour, seedKey: "msg-grp-6" },
    { convSeedKey: "chat-group", senderId: ekaterinaId, body: "Тоже поддерживаю четверг, 18:30.", systemType: "text", sentAtOffset: 10 * hour, seedKey: "msg-grp-7" },
    { convSeedKey: "chat-group", senderId: annaId, body: "Опрос: Голосуем за 1-к квартиру на ул. Северная!", systemType: "poll", sentAtOffset: 45 * minute, seedKey: "msg-grp-8" },

    // --- Chat Owner ---
    { convSeedKey: "chat-owner", senderId: annaId, body: "Здравствуйте! Наша группа готова посмотреть вашу квартиру на ул. Северная.", systemType: "text", sentAtOffset: 3 * hour, seedKey: "msg-own-1" },
    { convSeedKey: "chat-owner", senderId: ownerId, body: "Здравствуйте, Анна! Готовы показать объект. Какое время вам было бы удобно?", systemType: "text", sentAtOffset: 2 * hour, seedKey: "msg-own-2" },
    { convSeedKey: "chat-owner", senderId: annaId, body: JSON.stringify({
        content: "Запрос на просмотр квартиры на ул. Северная",
        viewingData: {
          id: `view-seed-1`,
          propertyId: propertyId,
          date: "Четверг, 24 Июля",
          timeSlot: "18:30",
          status: "pending",
          requestedBy: "user",
        }
      }),
      systemType: "viewing_request",
      sentAtOffset: 45 * minute,
      seedKey: "msg-own-3"
    },
    { convSeedKey: "chat-owner", senderId: ownerId, body: "Приглашение на просмотр сформировано. Ожидайте подтверждения.", systemType: "text", sentAtOffset: 15 * minute, seedKey: "msg-own-4" },
  ];

  for (const m of messagesScenario) {
    const convId = convIds[m.convSeedKey];
    if (!convId || !m.senderId) continue;

    const sentAt = new Date(now - m.sentAtOffset).toISOString();
    await supabase.from("messages").upsert(
      {
        conversation_id: convId,
        sender_id: m.senderId,
        body: m.body,
        system_type: m.systemType,
        sent_at: sentAt,
        is_demo: true,
        seed_key: m.seedKey,
      },
      { onConflict: "seed_key" }
    );
  }

  // 7. System Notifications for Anna
  const notificationsScenario = [
    { seedKey: "notif-1", title: "Новое сообщение", body: "Мария отправила сообщение: 'Давайте обсудим просмотр в четверг!'", type: "message", isRead: false },
    { seedKey: "notif-2", title: "Заявка на просмотр", body: "Запрос на просмотр квартиры на ул. Северная отправлен собственнику", type: "application", isRead: true },
    { seedKey: "notif-3", title: "Опрос в группе", body: "Группа 'Квартира в центре' выбрала четверг в 18:30", type: "group", isRead: false },
  ];

  for (const n of notificationsScenario) {
    await supabase.from("notifications").upsert(
      {
        profile_id: annaId,
        title: n.title,
        body: n.body,
        type: n.type,
        is_read: n.isRead,
        is_demo: true,
        seed_key: n.seedKey,
      },
      { onConflict: "seed_key" }
    );
  }

  console.log("✅ Seed completed successfully! All synthetic accounts and entities are populated.");
  return {
    success: true,
    stats: {
      users: Object.keys(userIds).length,
      propertyId,
      groupId,
      applicationId,
      conversations: Object.keys(convIds).length,
      messages: messagesScenario.length,
    },
  };
}

if (require.main === module) {
  seedDemoAccounts()
    .then((res) => {
      console.log("Seed result:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
