import { demoProperties, demoRoommates } from "../../data/demo";
import type {
  ChatMessage,
  ChatMessageType,
  ChatThread,
  DemoAnswer,
  DemoApplication,
  DemoGroup,
  DemoState,
  Repository,
} from "./types";

const storageKey = "sosedi-demo-state-v2";

const initialThreads: ChatThread[] = [
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
  },
  {
    id: "group",
    name: "Квартира в центре",
    type: "group",
    avatars: ["/demo/people/maria.jpg", "/demo/people/artem.jpg", "/demo/people/ekaterina.jpg"],
    sublabel: "Группа сожителей · 3 участника",
    propertyId: "center-loft",
    lastMessage: "Артём: Я обновил бюджет группы на 90 000 ₽",
    lastMessageTime: "Вчера",
    unreadCount: 1,
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
  maria: [
    {
      id: "m1",
      senderId: "maria",
      senderName: "Мария",
      senderAvatar: "/demo/people/maria.jpg",
      content: "Привет! Я посмотрела квартиру на Северной. Район и бюджет нам идеально подходят, давай обсудим просмотр?",
      timestamp: "12:30",
      isRead: true,
    },
    {
      id: "m2",
      senderId: "user",
      senderName: "Вы",
      content: "Да, четверг после 18:00 подходит! Напишу группе и подтвержу.",
      timestamp: "12:35",
      isRead: true,
    },
    {
      id: "m3",
      senderId: "maria",
      senderName: "Мария",
      senderAvatar: "/demo/people/maria.jpg",
      content: "Давайте обсудим просмотр в четверг. И ещё вопрос про тихий час — лучше договориться заранее.",
      timestamp: "12:40",
      isRead: false,
    },
  ],
  group: [
    {
      id: "g1",
      senderId: "system",
      senderName: "Система",
      content: "Группа «Квартира в центре» сформирована! Совместимость участников 89%.",
      timestamp: "Вчера, 10:00",
      type: "system_notice",
    },
    {
      id: "g2",
      senderId: "artem",
      senderName: "Артём",
      senderAvatar: "/demo/people/artem.jpg",
      content: "Я обновил бюджет группы на 90 000 ₽. Подали заявку на 1-комн. квартиру на Северной!",
      timestamp: "Вчера, 14:20",
      isRead: false,
    },
  ],
  owner: [
    {
      id: "o1",
      senderId: "user",
      senderName: "Вы",
      content: "Здравствуйте! Наша группа готова посмотреть вашу квартиру на ул. Северная.",
      timestamp: "12 мая, 11:00",
      isRead: true,
    },
    {
      id: "o2",
      senderId: "owner",
      senderName: "Собственник",
      content: "Здравствуйте! Заявка вашей группы принята. Готовы показать объект сегодня после 18:00.",
      timestamp: "12 мая, 11:45",
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
    return state.threads;
  }

  async getMessages(threadId: string) {
    const state = readState();
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
    propertyId?: string
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
      propertyId,
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
      thread.lastMessage = type === "property_card" ? "Карточка объекта" : content;
      thread.lastMessageTime = nowStr;
    }

    writeState(state);
    return userMessage;
  }
}
