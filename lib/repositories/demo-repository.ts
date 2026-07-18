import { demoProperties, demoRoommates } from "../../data/demo";
import type {
  ChatMessage,
  ChatMessageType,
  ChatThread,
  DemoAnswer,
  DemoApplication,
  DemoGroup,
  DemoState,
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
    const normalized = query.trim().toLocaleLowerCase("ru");
    return normalized
      ? demoRoommates.filter((person) =>
          [person.name, person.job, person.district, ...person.traits]
            .join(" ")
            .toLocaleLowerCase("ru")
            .includes(normalized),
        )
      : demoRoommates;
  }

  async listProperties(query = "") {
    const normalized = query.trim().toLocaleLowerCase("ru");
    return normalized
      ? demoProperties.filter((property) =>
          [property.title, property.district]
            .join(" ")
            .toLocaleLowerCase("ru")
            .includes(normalized),
        )
      : demoProperties;
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
    }
  ): Promise<ChatMessage> {
    const state = readState();
    const nowStr = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user",
      senderName: "Вы",
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
}
