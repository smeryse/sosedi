/**
 * Validation Module - Zod schemas for all Server Actions
 * 
 * Usage:
 * import { schemas, validateOrThrow } from "@/lib/validation";
 * 
 * const data = validateOrThrow(schemas.property.create, rawInput);
 */

export * from "./schemas";
export {
  validateSchema,
  validateOrThrow,
  withValidation,
  schemas,
} from "./schemas";
