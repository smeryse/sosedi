// Public surface of the mobile compatibility module.
// Internally delegates to the shared web engine — no logic duplication.

export { compatibilityQuestions } from "./questions";
export type {
  CompatibilityProfile,
  CompatibilityResult,
  Frequency,
  PetPreference,
  SleepSchedule,
} from "./types";
export {
  compatibilityScore,
  groupCompatibility,
  propertyGroupCompatibility,
} from "./engine";
