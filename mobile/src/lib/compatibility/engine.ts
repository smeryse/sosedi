// Re-exports the compatibility engine from the shared web compatibility module.
// Algorithm and tests live in /lib/compatibility/engine.* — single source of truth.

export {
  compatibilityScore,
  groupCompatibility,
  propertyGroupCompatibility,
} from "../../../../lib/compatibility/engine";
