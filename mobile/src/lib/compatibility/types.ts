// Re-exports types from the shared web compatibility module.
// Single source of truth lives in /lib/compatibility/types.ts.
// Do not duplicate type definitions here — update the source.

export type {
  CompatibilityProfile,
  CompatibilityResult,
  Frequency,
  PetPreference,
  SleepSchedule,
} from "../../../../lib/compatibility/types";
