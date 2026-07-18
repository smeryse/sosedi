import type { DemoProperty, DemoRoommate } from "@/data/demo";

export type DemoGroup = {
  id: string;
  name: string;
  status: "forming" | "ready" | "application_sent" | "under_review";
  memberIds: string[];
  targetBudget: number;
  moveInDate: string;
  compatibility: number;
};

export type DemoApplication = {
  id: string;
  propertyId: string;
  groupId: string;
  status: "draft" | "submitted" | "reviewing" | "needs_response" | "approved";
  createdAt: string;
};

export type DemoAnswer = {
  questionKey: string;
  answer: string;
  importance: number;
};

export type DemoState = {
  favorites: { type: "profile" | "property"; id: string }[];
  group: DemoGroup | null;
  applications: DemoApplication[];
  answers: DemoAnswer[];
};

export interface Repository {
  listRoommates(query?: string): Promise<DemoRoommate[]>;
  listProperties(query?: string): Promise<DemoProperty[]>;
  getState(): Promise<DemoState>;
  toggleFavorite(type: "profile" | "property", id: string): Promise<DemoState>;
  saveAnswer(answer: DemoAnswer): Promise<DemoState>;
  createGroup(input: Pick<DemoGroup, "name" | "targetBudget" | "moveInDate">): Promise<DemoGroup>;
  submitApplication(input: Pick<DemoApplication, "propertyId" | "groupId">): Promise<DemoApplication>;
}
