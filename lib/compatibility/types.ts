export type SleepSchedule = "early" | "late" | "flexible";
export type Frequency = "never" | "rarely" | "sometimes" | "often";

export type CompatibilityProfile = {
  budgetMin: number;
  budgetMax: number;
  districts: string[];
  moveInDate: string;
  leaseMonths: number;
  smoking: "no" | "sometimes" | "yes";
  pets: "no" | "cat" | "dog" | "other";
  sleep: SleepSchedule;
  noise: number;
  guests: Frequency;
  remoteWork: Frequency;
  cleanliness: number;
  cooking: number;
  sharedProducts: boolean;
  temperature: number;
  privateSpace: number;
  commonZones: number;
  sociability: number;
  leisure: string[];
};

export type CompatibilityResult = {
  score: number;
  confidence: number;
  hardConstraints: { passed: boolean; label: string; reason: string }[];
  breakdown: { label: string; score: number; weight: number }[];
  positives: string[];
  risks: string[];
  blockingConflicts: string[];
  discussionQuestions: string[];
};
