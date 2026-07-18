import { demoProperties, demoRoommates } from "../../data/demo";
import { compatibilityScore } from "../compatibility/engine";
import type { CompatibilityProfile } from "../compatibility/types";
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

const storageKey = "sosedi-demo-state-v3";

const initialThreads: ChatThread[] = [
  {
    id: "ai-assistant",
    name: "ИИ-Ассистент Соседей 🤖",
    type: "ai_assistant",
    avatar: "/demo/people/artem.jpg",
    sublabel: "Помощник по правилам и договору",
    lastMessage: "Здравствуйте! Чем я могу помочь вашей группе сегодня?",
    lastMessageTime: "Только что",
    unreadCount: 0,
    isOnline: true,
    isPinned: true,
  },
  {
    id: "maria",
    name: "Мария",
    type: "roommate",
    avatar: "/demo/people/maria.jpg",
    sublabel: "Сосед · 96% совпадение",
    propertyId: "center-loft",
    lastMessage: "Давайте обсудим просмотр в четверг. И ещё вопрос про тихий час.",
    lastMessageTime: "12:40",
    unreadCount: 1,
    isOnline: true,
    isPinned: true,
  },
  {
    id: "group",
    name: "Квартира в центре",
    type: "group",
    avatars: ["/demo/people/maria.jpg", "/demo/people/artem.jpg", "/demo/people/ekaterina.jpg"],
    sublabel: "Группа сожителей · 3 участника",
    propertyId: "center-loft",
    lastMessage: "Опрос: Голосуем за 1-к квартиру на Северной?",
    lastMessageTime: "13:15",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "owner",
    name: "Собственник (АРЕАТОР)",
    type: "owner",
    sublabel: "1-комн. квартира, 35 м² — ул. Северная, д. 426",
    propertyId: "center-loft",
    lastMessage: "Готовы показать объект сегодня после 18:00",
    lastMessageTime: "12 мая",
    unreadCount: 0,
    isOnline: false,
  },
];

const initialMessages: Record<string, ChatMessage[]> = {
  "ai-assistant": [
    {
      id: "ai-1",
      senderId: "ai-assistant",
      senderName: "ИИ-Ассистент Соседей",
      content:
        "Здравствуйте! Я ваш виртуальный помощник по совместной аренде.\n\nЯ могу помочь вам:\n• Составить свод правил проживания (тихий час, уборка, гости)\n• Проверить условия договора аренды\n• Рассчитать справедливый бюджет на каждого участника группы",
      timestamp: "10:00",
      type: "ai_bot",
      isRead: true,
    },
  ],
  maria: [
    {
      id: "m1",
      senderId: "maria",
      senderName: "Мария",
      senderAvatar: "/demo/people/maria.jpg",
      content:
        "Привет! Я посмотрела квартиру на Северной. Район и бюджет нам идеально подходят, давай обсудим просмотр?",
      timestamp: "12:30",
      isRead: true,
    },
    {
      id: "m2",
      senderId: "maria",
      senderName: "Мария",
      senderAvatar: "/demo/people/maria.jpg",
      content: "Аудиосообщение (0:14)",
      timestamp: "12:32",
      type: "voice",
      voiceDuration: "0:14",
      isRead: true,
    },
    {
      id: "m3",
      senderId: "user",
      senderName: "Вы",
      content: "Да, четверг после 18:00 подходит! Напишу группе и подтвержу.",
      timestamp: "12:35",
      isRead: true,
    },
    {
      id: "m4",
      senderId: "maria",
      senderName: "Мария",
      senderAvatar: "/demo/people/maria.jpg",
      content:
        "Давайте обсудим просмотр в четверг. И ещё вопрос про тихий час — лучше договориться заранее.",
      timestamp: "12:40",
      isRead: false,
      reactions: { "👍": 1 },
    },
  ],
  group: [
    {
      id: "g1",
      senderId: "system",
      senderName: "Система",
      content:
        "Группа «Квартира в центре» сформирована! Совместимость участников 89%.",
      timestamp: "Вчера, 10:00",
      type: "system_notice",
    },
    {
      id: "g2",
      senderId: "artem",
      senderName: "Артём",
      senderAvatar: "/demo/people/artem.jpg",
      content: "Создан опрос по выбору объекта:",
      timestamp: "13:00",
      type: "poll",
      pollData: {
        id: "poll-1",
        question: "Голосуем за 1-к квартиру на Северной (25 000 ₽)?",
        options: [
          { id: "opt-1", text: "Да, отличный вариант!", voterIds: ["maria", "artem"] },
          { id: "opt-2", text: "Хочу посмотреть еще на Красной", voterIds: ["ekaterina"] },
        ],
        totalVotes: 3,
      },
    },
    {
      id: "g3",
      senderId: "ekaterina",
      senderName: "Екатерина",
      senderAvatar: "/demo/people/ekaterina.jpg",
      content: "Расчёт общего залога и коммуны на 3 человек:",
      timestamp: "13:15",
      type: "expense_split",
      expenseData: {
        id: "exp-1",
        title: "Залог 25 000 ₽ + Аренда 1 мес.",
        totalAmount: 50000,
        shares: [
          { memberId: "maria", memberName: "Мария", amount: 16666, isPaid: true },
          { memberId: "artem", memberName: "Артём", amount: 16667, isPaid: false },
          { memberId: "ekaterina", memberName: "Екатерина", amount: 16667, isPaid: true },
        ],
      },
    },
  ],
  owner: [
    {
      id: "o1",
      senderId: "user",
      senderName: "Вы",
      content:
        "Здравствуйте! Наша группа готова посмотреть вашу квартиру на ул. Северная.",
      timestamp: "12 мая, 11:00",
      isRead: true,
    },
    {
      id: "o2",
      senderId: "owner",
      senderName: "Собственник",
      content: "Приглашение на просмотр:",
      timestamp: "12 мая, 11:45",
      type: "viewing_request",
      viewingData: {
        id: "view-1",
        propertyId: "center-loft",
        date: "Четверг, 24 Июля",
        timeSlot: "18:30",
        status: "pending",
        requestedBy: "owner",
      },
      isRead: true,
    },
  ],
};

const demoChores = [
  { id: "chore-1", title: "Кухня и плита", assigneeId: "maria", assigneeName: "Мария", isDone: true, dueDate: "до воскресенья" },
  { id: "chore-2", title: "Ванная комната", assigneeId: "anna", assigneeName: "Анна", isDone: false, dueDate: "до воскресенья" },
  { id: "chore-3", title: "Пылесос", assigneeId: "artem", assigneeName: "Артём", isDone: false, dueDate: "до воскресенья" },
  { id: "chore-4", title: "Мусор и переработка", assigneeId: "ekaterina", assigneeName: "Екатерина", isDone: false, dueDate: "до воскресенья" }
];

const demoExpenses = [
  {
    id: "exp-1",
    title: "Аренда квартиры",
    totalAmount: 45000,
    shares: [
      { memberId: "maria", memberName: "Мария", amount: 15000, isPaid: true },
      { memberId: "anna", memberName: "Анна", amount: 15000, isPaid: true },
      { memberId: "artem", memberName: "Артём", amount: 15000, isPaid: true },
    ]
  },
  {
    id: "exp-2",
    title: "Коммунальные услуги",
    totalAmount: 5430,
    shares: [
      { memberId: "maria", memberName: "Мария", amount: 1810, isPaid: true },
      { memberId: "anna", memberName: "Анна", amount: 1810, isPaid: false },
      { memberId: "artem", memberName: "Артём", amount: 1810, isPaid: false },
    ]
  },
  {
    id: "exp-3",
    title: "Интернет",
    totalAmount: 890,
    shares: [
      { memberId: "maria", memberName: "Мария", amount: 296.6, isPaid: true },
      { memberId: "anna", memberName: "Анна", amount: 296.6, isPaid: true },
      { memberId: "artem", memberName: "Артём", amount: 296.8, isPaid: true },
    ]
  },
  {
    id: "exp-4",
    title: "Хозяйственные товары",
    totalAmount: 1260,
    shares: [
      { memberId: "maria", memberName: "Мария", amount: 420, isPaid: true },
      { memberId: "anna", memberName: "Анна", amount: 420, isPaid: false },
      { memberId: "artem", memberName: "Артём", amount: 420, isPaid: false },
    ]
  }
];

const roommateProfiles: Record<string, CompatibilityProfile> = {
  maria: {
    budgetMin: 20000,
    budgetMax: 30000,
    districts: ["Центр", "Фестивальный"],
    moveInDate: new Date().toISOString().split("T")[0],
    leaseMonths: 12,
    smoking: "no",
    pets: "no",
    petTolerance: "any",
    sleep: "flexible",
    noise: 2,
    guests: "rarely",
    remoteWork: "sometimes",
    cleanliness: 4,
    cooking: 3,
    sharedProducts: true,
    temperature: 3,
    privateSpace: 3,
    commonZones: 3,
    sociability: 4,
    leisure: ["Кино и книги", "Спорт и прогулки"],
  },
  artem: {
    budgetMin: 25000,
    budgetMax: 35000,
    districts: ["Прикубанский округ", "Панорама"],
    moveInDate: new Date().toISOString().split("T")[0],
    leaseMonths: 12,
    smoking: "no",
    pets: "no",
    petTolerance: "no",
    sleep: "late",
    noise: 1,
    guests: "never",
    remoteWork: "often",
    cleanliness: 3,
    cooking: 2,
    sharedProducts: false,
    temperature: 3,
    privateSpace: 5,
    commonZones: 2,
    sociability: 2,
    leisure: ["Игры и встречи"],
  },
  ekaterina: {
    budgetMin: 25000,
    budgetMax: 35000,
    districts: ["Западный округ", "Центр"],
    moveInDate: new Date().toISOString().split("T")[0],
    leaseMonths: 12,
    smoking: "no",
    pets: "cat",
    petTolerance: "cat",
    sleep: "early",
    noise: 2,
    guests: "sometimes",
    remoteWork: "sometimes",
    cleanliness: 5,
    cooking: 4,
    sharedProducts: true,
    temperature: 4,
    privateSpace: 3,
    commonZones: 4,
    sociability: 3,
    leisure: ["Кино и книги", "Спорт и прогулки"],
  },
  ilya: {
    budgetMin: 20000,
    budgetMax: 30000,
    districts: ["Карасунский округ", "Черёмушки"],
    moveInDate: new Date().toISOString().split("T")[0],
    leaseMonths: 6,
    smoking: "sometimes",
    pets: "no",
    petTolerance: "any",
    sleep: "late",
    noise: 3,
    guests: "never",
    remoteWork: "often",
    cleanliness: 3,
    cooking: 2,
    sharedProducts: false,
    temperature: 3,
    privateSpace: 4,
    commonZones: 2,
    sociability: 2,
    leisure: ["Спорт и прогулки", "Игры и встречи"],
  },
};

function mapAnswersToProfile(answers: DemoAnswer[]): CompatibilityProfile {
  const getAnswer = (key: string) => answers.find(a => a.questionKey === key)?.answer || "";
  
  const budgetStr = getAnswer("budget");
  let budgetMin = 0;
  let budgetMax = 150000;
  if (budgetStr.includes("До")) {
    budgetMax = 20000;
  } else if (budgetStr.includes("–")) {
    const parts = budgetStr.replace(/[^\d–]/g, "").split("–");
    budgetMin = parseInt(parts[0], 10) || 0;
    budgetMax = parseInt(parts[1], 10) || 150000;
  } else if (budgetStr.includes("От")) {
    budgetMin = parseInt(budgetStr.replace(/[^\d]/g, ""), 10) || 0;
  }

  const districtStr = getAnswer("districts");
  const districts = districtStr && districtStr !== "Готов рассмотреть любой" ? [districtStr] : [];

  const moveInDateStr = getAnswer("moveInDate");
  const moveInDate = moveInDateStr === "В течение месяца" 
    ? new Date().toISOString().split("T")[0]
    : new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

  const leaseStr = getAnswer("leaseMonths");
  let leaseMonths = 12;
  if (leaseStr.includes("3–6")) leaseMonths = 6;
  else if (leaseStr.includes("6–12")) leaseMonths = 12;

  const sleepStr = getAnswer("sleep");
  let sleep: "early" | "late" | "flexible" = "flexible";
  if (sleepStr.includes("Рано")) sleep = "early";
  else if (sleepStr.includes("Поздно")) sleep = "late";

  const noiseStr = getAnswer("noise");
  let noise = 3;
  if (noiseStr.includes("тишину")) noise = 1;
  else if (noiseStr.includes("не мешает")) noise = 5;

  const guestsStr = getAnswer("guests");
  let guests: "never" | "rarely" | "sometimes" | "often" = "sometimes";
  if (guestsStr.includes("никогда")) guests = "never";
  else if (guestsStr.includes("Часто")) guests = "often";

  const smokingStr = getAnswer("smoking");
  let smoking: "no" | "sometimes" | "yes" = "no";
  if (smokingStr.includes("Иногда")) smoking = "sometimes";
  else if (smokingStr.includes("Курю")) smoking = "yes";

  const petsStr = getAnswer("pets");
  let pets: "no" | "cat" | "dog" | "other" = "no";
  if (petsStr.includes("кошка")) pets = "cat";
  else if (petsStr.includes("собака")) pets = "dog";

  const petToleranceStr = getAnswer("petTolerance");
  let petTolerance: "no" | "cat" | "dog" | "any" = "any";
  if (petToleranceStr.includes("кошки")) petTolerance = "cat";
  else if (petToleranceStr.includes("собаки")) petTolerance = "dog";
  else if (petToleranceStr.includes("Против")) petTolerance = "no";

  const cleanlinessStr = getAnswer("cleanliness");
  let cleanliness = 3;
  if (cleanlinessStr.includes("чисто")) cleanliness = 5;
  else if (cleanlinessStr.includes("не важен")) cleanliness = 1;

  const cookingStr = getAnswer("cooking");
  let cooking = 3;
  if (cookingStr.includes("не готовлю")) cooking = 1;
  else if (cookingStr.includes("часто")) cooking = 5;

  const sharedStr = getAnswer("sharedProducts");
  const sharedProducts = sharedStr.includes("Да");

  const remoteStr = getAnswer("remoteWork");
  let remoteWork: "never" | "rarely" | "sometimes" | "often" = "sometimes";
  if (remoteStr.includes("Не работаю")) remoteWork = "never";
  else if (remoteStr.includes("всегда")) remoteWork = "often";

  const tempStr = getAnswer("temperature");
  let temperature = 3;
  if (tempStr.includes("Прохладно")) temperature = 1;
  else if (tempStr.includes("Тепло")) temperature = 5;

  const privateStr = getAnswer("privateSpace");
  let privateSpace = 3;
  if (privateStr.includes("Очень")) privateSpace = 5;
  else if (privateStr.includes("общение")) privateSpace = 1;

  const commonStr = getAnswer("commonZones");
  let commonZones = 3;
  if (commonStr.includes("Тихие")) commonZones = 1;
  else if (commonStr.includes("Много")) commonZones = 5;

  const socStr = getAnswer("sociability");
  let sociability = 3;
  if (socStr.includes("уединение")) sociability = 1;
  else if (socStr.includes("компанию")) sociability = 5;

  const leisureStr = getAnswer("leisure");
  const leisure = leisureStr ? [leisureStr] : [];

  return {
    budgetMin,
    budgetMax,
    districts,
    moveInDate,
    leaseMonths,
    smoking,
    pets,
    petTolerance,
    sleep,
    noise,
    guests,
    remoteWork,
    cleanliness,
    cooking,
    sharedProducts,
    temperature,
    privateSpace,
    commonZones,
    sociability,
    leisure,
  };
}

const initialState: DemoState = {
  favorites: [
    { type: "profile", id: "maria" },
    { type: "property", id: "center-loft" },
  ],
  group: {
    id: "demo-group",
    name: "Квартира в центре",
    status: "ready",
    memberIds: ["maria", "artem", "ekaterina"],
    targetBudget: 90_000,
    moveInDate: "2026-08-15",
    compatibility: 89,
  },
  applications: [
    {
      id: "application-34872",
      propertyId: "center-loft",
      groupId: "demo-group",
      status: "needs_response",
      createdAt: "2026-05-12T10:30:00.000Z",
    },
  ],
  answers: [],
  threads: initialThreads,
  messages: initialMessages,
  chores: demoChores,
  expenses: demoExpenses,
};

let memoryState: DemoState | null = null;

function cloneState(state: DemoState): DemoState {
  return JSON.parse(JSON.stringify(state)) as DemoState;
}

function readState(): DemoState {
  if (typeof window === "undefined") {
    if (!memoryState) memoryState = cloneState(initialState);
    return cloneState(memoryState);
  }
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return cloneState(initialState);
  try {
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return {
      ...cloneState(initialState),
      ...parsed,
      threads: parsed.threads && parsed.threads.length ? parsed.threads : initialState.threads,
      messages: parsed.messages && Object.keys(parsed.messages).length ? parsed.messages : initialState.messages,
    };
  } catch {
    return cloneState(initialState);
  }
}

function writeState(state: DemoState) {
  if (typeof window === "undefined") {
    memoryState = cloneState(state);
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function ensureThreadExists(state: DemoState, threadId: string): ChatThread {
  let thread = state.threads.find((t) => t.id === threadId);
  if (thread) return thread;

  const person = demoRoommates.find((r) => r.id === threadId);
  if (person) {
    thread = {
      id: person.id,
      name: person.name,
      type: "roommate",
      avatar: person.image,
      sublabel: `Сосед · ${person.compatibility}% совпадение`,
      lastMessage: `Привет! Рад(а) пообщаться!`,
      lastMessageTime: "Только что",
      unreadCount: 0,
      isOnline: true,
    };
    state.threads.push(thread);
    state.messages[threadId] = [
      {
        id: `msg-init-${Date.now()}`,
        senderId: person.id,
        senderName: person.name,
        senderAvatar: person.image,
        content: `Привет! Я посмотрел(а) ваш профиль. Готов(а) обсудить совместный поиск жилья в районе ${person.district}!`,
        timestamp: "Только что",
        isRead: true,
      },
    ];
    writeState(state);
    return thread;
  }

  const property = demoProperties.find((p) => p.id === threadId);
  if (property) {
    thread = {
      id: property.id,
      name: `Собственник (${property.title.slice(0, 25)}...)`,
      type: "owner",
      sublabel: property.address,
      propertyId: property.id,
      lastMessage: "Здравствуйте! Объявление актуально.",
      lastMessageTime: "Только что",
      unreadCount: 0,
      isOnline: true,
    };
    state.threads.push(thread);
    state.messages[threadId] = [
      {
        id: `msg-init-${Date.now()}`,
        senderId: "owner",
        senderName: "Собственник",
        content: `Здравствуйте! Объявление «${property.title}» по адресу ${property.address} актуально. Готовы ответить на ваши вопросы и показать объект!`,
        timestamp: "Только что",
        isRead: true,
      },
    ];
    writeState(state);
    return thread;
  }

  thread = {
    id: threadId,
    name: "Диалог",
    type: "roommate",
    lastMessage: "Начните общение",
    lastMessageTime: "Только что",
    unreadCount: 0,
  };
  state.threads.push(thread);
  state.messages[threadId] = [];
  writeState(state);
  return thread;
}

export class DemoRepository implements Repository {
  async listRoommates(query = "") {
    const state = readState();
    const normalized = query.trim().toLocaleLowerCase("ru");
    
    const userAnswers = state.answers;
    const hasAnswers = userAnswers.length > 0;
    const userProfile = hasAnswers ? mapAnswersToProfile(userAnswers) : null;

    const roommates = demoRoommates.map((person) => {
      if (userProfile && roommateProfiles[person.id]) {
        const scoreResult = compatibilityScore(userProfile, roommateProfiles[person.id]);
        return {
          ...person,
          compatibility: scoreResult.score,
        };
      }
      return person;
    });

    roommates.sort((a, b) => b.compatibility - a.compatibility);

    return normalized
      ? roommates.filter((person) =>
          [person.name, person.job, person.district, ...person.traits]
            .join(" ")
            .toLocaleLowerCase("ru")
            .includes(normalized),
        )
      : roommates;
  }

  async listProperties(filters: PropertyFilters = {}) {
    const { query, city, districts, minPrice, maxPrice, rooms, rentalTerm, petsAllowed, furnished, sortBy } = filters;
    const normalized = query?.trim().toLocaleLowerCase("ru") || "";
    const cityFilter = city?.trim().toLocaleLowerCase("ru") || "";
    const districtFilters = districts?.map(d => d.trim().toLocaleLowerCase("ru")) || [];
    const roomFilters = rooms || [];
    
    let filtered = demoProperties.filter((property) => {
      // Text search
      if (normalized) {
        const searchable = [property.title, property.district, property.address].join(" ").toLocaleLowerCase("ru");
        if (!searchable.includes(normalized)) return false;
      }
      
      // City filter (for now all are Krasnodar, but we add the field)
      if (cityFilter && property.address.toLocaleLowerCase("ru").indexOf(cityFilter) === -1) return false;
      
      // District filter
      if (districtFilters.length > 0 && !districtFilters.some(d => property.district.toLocaleLowerCase("ru").includes(d))) return false;
      
      // Price filter
      if (minPrice !== undefined && property.price < minPrice) return false;
      if (maxPrice !== undefined && property.price > maxPrice) return false;
      
      // Rooms filter
      if (roomFilters.length > 0 && !roomFilters.includes(property.rooms)) return false;
      
      // Pets filter (check tags)
      if (petsAllowed !== undefined) {
        const hasPets = property.tags.some(t => t.toLowerCase().includes("животн") || t.toLowerCase().includes("pet"));
        if (petsAllowed && !hasPets) return false;
        if (!petsAllowed && hasPets) return false;
      }
      
      // Furnished filter (check tags)
      if (furnished !== undefined) {
        const hasFurnished = property.tags.some(t => t.toLowerCase().includes("мебел") || t.toLowerCase().includes("furnish"));
        if (furnished && !hasFurnished) return false;
        if (!furnished && hasFurnished) return false;
      }
      
      return true;
    });
    
    // Sorting
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "match":
      default:
        filtered.sort((a, b) => b.match - a.match);
        break;
    }
    
    return filtered;
  }

  async getState() {
    return readState();
  }

  async toggleFavorite(type: "profile" | "property", id: string) {
    const state = readState();
    const index = state.favorites.findIndex((item) => item.type === type && item.id === id);
    if (index >= 0) state.favorites.splice(index, 1);
    else state.favorites.push({ type, id });
    writeState(state);
    return state;
  }

  async saveAnswer(answer: DemoAnswer) {
    const state = readState();
    const existing = state.answers.findIndex((item) => item.questionKey === answer.questionKey);
    if (existing >= 0) state.answers[existing] = answer;
    else state.answers.push(answer);
    writeState(state);
    return state;
  }

  async createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">) {
    const state = readState();
    const group: DemoGroup = {
      id: `group-${Date.now()}`,
      ...input,
      status: "forming",
      memberIds: ["maria"],
      compatibility: 82,
    };
    state.group = group;
    writeState(state);
    return group;
  }

  async submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId">) {
    const state = readState();
    const application: DemoApplication = {
      id: `application-${Date.now()}`,
      ...input,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    state.applications.unshift(application);
    writeState(state);
    return application;
  }

  async getChatThreads() {
    const state = readState();
    return state.threads.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }

  async getMessages(threadId: string) {
    const state = readState();
    ensureThreadExists(state, threadId);
    return state.messages[threadId] || [];
  }

  async markThreadAsRead(threadId: string) {
    const state = readState();
    const threadIndex = state.threads.findIndex((t) => t.id === threadId);
    if (threadIndex >= 0) {
      state.threads[threadIndex].unreadCount = 0;
    }
    if (state.messages[threadId]) {
      state.messages[threadId] = state.messages[threadId].map((msg) => ({
        ...msg,
        isRead: true,
      }));
    }
    writeState(state);
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
    }
  ): Promise<ChatMessage> {
    const state = readState();
    const nowStr = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

    // Determine sender based on type and custom parameters
    let senderId = "user";
    let senderName = "Вы";
    let senderAvatar = undefined;

    if (extraData?.senderId) {
      senderId = extraData.senderId;
      senderName = extraData.senderName || "";
      senderAvatar = extraData.senderAvatar;
    } else if (type === "ai_bot") {
      senderId = "ai-assistant";
      senderName = "ИИ-Ассистент Соседей";
      senderAvatar = "/demo/avatar-ai.jpg";
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderAvatar,
      content,
      timestamp: nowStr,
      type,
      propertyId: extraData?.propertyId,
      viewingData: extraData?.viewingData,
      pollData: extraData?.pollData,
      expenseData: extraData?.expenseData,
      voiceDuration: extraData?.voiceDuration,
      isRead: true,
    };

    if (!state.messages[threadId]) {
      state.messages[threadId] = [];
    }
    state.messages[threadId].push(userMessage);

    // Update last message in thread
    const threadIndex = state.threads.findIndex((t) => t.id === threadId);
    if (threadIndex >= 0) {
      const thread = state.threads[threadIndex];
      if (type === "property_card") thread.lastMessage = "Карточка объекта";
      else if (type === "viewing_request") thread.lastMessage = "Запрос на просмотр";
      else if (type === "poll") thread.lastMessage = `Опрос: ${extraData?.pollData?.question || content}`;
      else if (type === "expense_split") thread.lastMessage = "Расчёт расходов";
      else thread.lastMessage = content;
      thread.lastMessageTime = nowStr;
    }

    writeState(state);
    return userMessage;
  }

  async voteInPoll(threadId: string, messageId: string, optionId: string): Promise<ChatMessage> {
    const state = readState();
    const msgs = state.messages[threadId] || [];
    const msg = msgs.find((m) => m.id === messageId);
    if (msg && msg.pollData) {
      msg.pollData.options.forEach((opt) => {
        const userIdx = opt.voterIds.indexOf("user");
        if (opt.id === optionId) {
          if (userIdx < 0) opt.voterIds.push("user");
        } else {
          if (userIdx >= 0) opt.voterIds.splice(userIdx, 1);
        }
      });
      msg.pollData.totalVotes = msg.pollData.options.reduce((acc, o) => acc + o.voterIds.length, 0);
      writeState(state);
      return msg;
    }
    return msgs[0];
  }

  async updateViewingStatus(
    threadId: string,
    messageId: string,
    status: ViewingBooking["status"]
  ): Promise<ChatMessage> {
    const state = readState();
    const msgs = state.messages[threadId] || [];
    const msg = msgs.find((m) => m.id === messageId);
    if (msg && msg.viewingData) {
      msg.viewingData.status = status;
      writeState(state);
      return msg;
    }
    return msgs[0];
  }

  async toggleExpensePaid(threadId: string, messageId: string, memberId: string): Promise<ChatMessage> {
    const state = readState();
    const msgs = state.messages[threadId] || [];
    const msg = msgs.find((m) => m.id === messageId);
    if (msg && msg.expenseData) {
      const share = msg.expenseData.shares.find((s) => s.memberId === memberId);
      if (share) share.isPaid = !share.isPaid;
      writeState(state);
      return msg;
    }
    return msgs[0];
  }

  async togglePinThread(threadId: string) {
    const state = readState();
    const thread = state.threads.find((t) => t.id === threadId);
    if (thread) {
      thread.isPinned = !thread.isPinned;
      writeState(state);
    }
    return state.threads;
  }

  async toggleMessageReaction(threadId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    const state = readState();
    const msgs = state.messages[threadId] || [];
    const msg = msgs.find((m) => m.id === messageId);
    if (msg) {
      if (!msg.reactions) msg.reactions = {};
      if (!msg.userReactions) msg.userReactions = [];

      const hasReacted = msg.userReactions.includes(emoji);
      if (hasReacted) {
        msg.userReactions = msg.userReactions.filter((e) => e !== emoji);
        msg.reactions[emoji] = (msg.reactions[emoji] || 1) - 1;
        if (msg.reactions[emoji] <= 0) delete msg.reactions[emoji];
      } else {
        msg.userReactions.push(emoji);
        msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
      }
      writeState(state);
      return msg;
    }
    return msgs[0];
  }

  async listChores(): Promise<DemoChore[]> {
    const state = readState();
    return state.chores;
  }

  async createChore(title: string, assigneeId: string, dueDate: string): Promise<DemoChore[]> {
    const state = readState();
    const names: Record<string, string> = {
      maria: "Мария",
      artem: "Артём",
      ekaterina: "Екатерина",
      anna: "Анна"
    };
    const newChore: DemoChore = {
      id: `chore-${Date.now()}`,
      title,
      assigneeId,
      assigneeName: names[assigneeId] || "Сожитель",
      isDone: false,
      dueDate: dueDate || "до воскресенья",
    };
    state.chores.push(newChore);
    writeState(state);
    return state.chores;
  }

  async toggleChoreDone(id: string): Promise<DemoChore[]> {
    const state = readState();
    const chore = state.chores.find((c) => c.id === id);
    if (chore) {
      chore.isDone = !chore.isDone;
      writeState(state);
    }
    return state.chores;
  }

  async listExpenses(): Promise<ExpenseSplit[]> {
    const state = readState();
    return state.expenses;
  }

  async createExpense(title: string, totalAmount: number, shares: ExpenseShare[]): Promise<ExpenseSplit[]> {
    const state = readState();
    const newExpense: ExpenseSplit = {
      id: `exp-${Date.now()}`,
      title,
      totalAmount,
      shares,
    };
    state.expenses.push(newExpense);
    writeState(state);
    return state.expenses;
  }

  async toggleGlobalExpensePaid(expenseId: string, memberId: string): Promise<ExpenseSplit[]> {
    const state = readState();
    const expense = state.expenses.find((e) => e.id === expenseId);
    if (expense) {
      const share = expense.shares.find((s) => s.memberId === memberId);
      if (share) {
        share.isPaid = !share.isPaid;
        writeState(state);
      }
    }
    return state.expenses;
  }
}
