import { demoProperties, demoRoommates } from "@/data/demo";
import type {
  DemoAnswer,
  DemoApplication,
  DemoGroup,
  DemoState,
  Repository,
} from "./types";

const storageKey = "sosedi-demo-state-v1";

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
};

function cloneState(state: DemoState): DemoState {
  return JSON.parse(JSON.stringify(state)) as DemoState;
}

function readState(): DemoState {
  if (typeof window === "undefined") return cloneState(initialState);
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return cloneState(initialState);
  try {
    return { ...cloneState(initialState), ...(JSON.parse(raw) as DemoState) };
  } catch {
    return cloneState(initialState);
  }
}

function writeState(state: DemoState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }
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
}
