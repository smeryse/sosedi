/**
 * Zod Schemas for Server Action Validation
 * All mutations must validate input through these schemas
 */

import { z } from "zod";

// ============================================
// Auth & Profile Schemas
// ============================================

export const SignUpSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  displayName: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(80),
  role: z.enum(["tenant", "owner"]).default("tenant"),
});

export const SignInSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Введите пароль"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Неверный формат email"),
});

export const UpdatePasswordSchema = z
  .object({
    password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const ProfileUpdateSchema = z.object({
  display_name: z.string().min(2).max(80).optional(),
  age: z.number().int().min(18).max(100).optional().nullable(),
  job_title: z.string().max(100).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  city: z.string().max(100).optional(),
  avatar_path: z.string().optional().nullable(),
  budget_min: z.number().int().min(0).optional().nullable(),
  budget_max: z.number().int().min(0).optional().nullable(),
  move_in_date: z.string().date().optional().nullable(),
  lease_months: z.number().int().min(1).max(120).optional().nullable(),
  is_public: z.boolean().optional(),
});

export const ProfilePreferencesSchema = z.object({
  districts: z.array(z.string()).default([]),
  smoking: z.enum(["no", "sometimes", "yes", "indifferent"]).default("no"),
  pets: z
    .enum(["no", "cat", "dog", "other", "indifferent"])
    .default("indifferent"),
  sleep_schedule: z.enum(["early", "late", "flexible"]).default("flexible"),
  noise_tolerance: z.number().int().min(1).max(5).optional().nullable(),
  guests_frequency: z
    .enum(["never", "rarely", "sometimes", "often"])
    .default("sometimes"),
  remote_work: z.enum(["never", "sometimes", "often"]).default("sometimes"),
  cleanliness: z.number().int().min(1).max(5).optional().nullable(),
  sociability: z.number().int().min(1).max(5).optional().nullable(),
  private_space: z.number().int().min(1).max(5).optional().nullable(),
  cooking: z.number().int().min(1).max(5).optional().nullable(),
  shared_products: z.boolean().default(true),
  temperature: z.number().int().min(1).max(5).optional().nullable(),
  common_zones: z.number().int().min(1).max(5).optional().nullable(),
  leisure: z.array(z.string()).default([]),
  pet_tolerance: z.enum(["no", "cat", "dog", "any"]).default("any"),
});

export const LifestyleAnswerSchema = z.object({
  questionKey: z.string().min(1),
  answer: z.unknown(), // Can be string, number, boolean, array
  importance: z.number().int().min(1).max(5).default(3),
});

export const CompatibilityWeightsSchema = z.object({
  criterion: z.string(),
  weight: z.number().min(0).max(1),
});

// ============================================
// Property Schemas
// ============================================

export const PropertyCreateSchema = z.object({
  title: z.string().min(4).max(160),
  description: z.string().max(5000).optional(),
  district: z.string().min(1),
  address: z.string().optional(),
  monthly_rent: z.number().int().positive(),
  deposit: z.number().int().min(0).default(0),
  rooms: z.number().int().min(1).max(20),
  area: z.number().positive(),
  floor: z.number().int().optional().nullable(),
  total_floors: z.number().int().optional().nullable(),
  available_from: z.string().date().optional().nullable(),
  lease_months_min: z.number().int().min(1).max(120).default(6),
  pets_allowed: z.boolean().default(false),
  smoking_allowed: z.boolean().default(false),
  status: z.enum(["draft", "published", "paused", "archived"]).default("draft"),
});

export const PropertyUpdateSchema = PropertyCreateSchema.partial();

export const PropertyFiltersSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  districts: z.array(z.string()).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  rooms: z.array(z.number().int().min(1).max(20)).optional(),
  rentalTerm: z.string().optional(),
  petsAllowed: z.boolean().optional(),
  furnished: z.boolean().optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest", "match"]).optional(),
});

// ============================================
// Group Schemas
// ============================================

export const GroupCreateSchema = z.object({
  name: z.string().min(2).max(100),
  targetBudget: z.number().int().positive().optional().nullable(),
  moveInDate: z.string().date().optional().nullable(),
});

export const GroupInviteSchema = z.object({
  groupId: z.string().uuid(),
  inviteeId: z.string().uuid(),
});

export const GroupMemberUpdateSchema = z.object({
  groupId: z.string().uuid(),
  profileId: z.string().uuid(),
  role: z.enum(["admin", "member"]).optional(),
  status: z
    .enum(["invited", "active", "declined", "left", "removed"])
    .optional(),
});

// ============================================
// Application Schemas
// ============================================

export const ApplicationCreateSchema = z.object({
  groupId: z.string().uuid(),
  propertyId: z.string().uuid(),
  totalBudget: z.number().int().positive(),
  moveInDate: z.string().date().optional().nullable(),
  leaseMonths: z.number().int().min(1).max(120).optional().nullable(),
});

export const ApplicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    "draft",
    "submitted",
    "reviewing",
    "needs_response",
    "approved",
    "rejected",
    "contract_agreed",
    "settled",
  ]),
  ownerNote: z.string().optional(),
});

export const ApplicationMemberConfirmSchema = z.object({
  applicationId: z.string().uuid(),
  profileId: z.string().uuid(),
  confirmed: z.boolean(),
});

// ============================================
// Message Schemas
// ============================================

export const MessageSendSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1, "Сообщение не может быть пустым").max(4000),
  type: z
    .enum([
      "text",
      "property_card",
      "viewing_request",
      "poll",
      "expense_split",
      "ai_bot",
      "system_notice",
    ])
    .default("text"),
  propertyId: z.string().optional(),
  viewingData: z
    .object({
      id: z.string(),
      propertyId: z.string().uuid(),
      date: z.string(),
      timeSlot: z.string(),
      status: z.enum(["pending", "confirmed", "rescheduled", "declined"]),
      requestedBy: z.string(),
    })
    .optional(),
  pollData: z
    .object({
      id: z.string(),
      question: z.string(),
      options: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          voterIds: z.array(z.string()).default([]),
        }),
      ),
      totalVotes: z.number().int().default(0),
    })
    .optional(),
  expenseData: z
    .object({
      id: z.string(),
      title: z.string(),
      totalAmount: z.number().int().positive(),
      shares: z.array(
        z.object({
          memberId: z.string(),
          memberName: z.string(),
          amount: z.number(),
          isPaid: z.boolean(),
        }),
      ),
    })
    .optional(),
  voiceDuration: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        storage_path: z.string(),
        mime_type: z.string(),
        byte_size: z.number().int().positive(),
      }),
    )
    .optional(),
});

export const PollVoteSchema = z.object({
  threadId: z.string().uuid(),
  messageId: z.string().uuid(),
  optionId: z.string(),
});

export const ViewingStatusSchema = z.object({
  threadId: z.string().uuid(),
  messageId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "rescheduled", "declined"]),
});

export const ChatExpensePaidSchema = z.object({
  threadId: z.string().uuid(),
  messageId: z.string().uuid(),
  memberId: z.string(),
});

export const ThreadPinSchema = z.object({
  threadId: z.string().uuid(),
});

export const MessageReactionSchema = z.object({
  threadId: z.string().uuid(),
  messageId: z.string().uuid(),
  emoji: z.string().min(1).max(4),
});

// ============================================
// Budget/Expense Schemas
// ============================================

export const ExpenseCreateSchema = z.object({
  groupId: z.string().uuid(),
  category: z.enum(["rent", "utilities", "deposit", "household", "other"]),
  description: z.string().min(2).max(200),
  amount: z.number().int().positive(),
  occurredOn: z.string().date().optional(),
  shares: z
    .array(
      z.object({
        profileId: z.string().uuid(),
        share: z.number().int().min(0),
      }),
    )
    .min(1),
});

export const ExpensePaidSchema = z.object({
  expenseId: z.string().uuid(),
  profileId: z.string().uuid(),
  paid: z.boolean(),
});

// ============================================
// Chore Schemas
// ============================================

export const ChoreCreateSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(2).max(160),
  zone: z.string().optional(),
  dueAt: z.string().datetime().optional().nullable(),
  recurrence: z.string().optional(),
  assigneeId: z.string().uuid().optional().nullable(),
});

export const ChoreUpdateSchema = z.object({
  choreId: z.string().uuid(),
  status: z.enum(["open", "done", "skipped"]).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
});

// ============================================
// Favorites Schema
// ============================================

export const FavoriteToggleSchema = z.object({
  type: z.enum(["profile", "property", "group"]),
  id: z.string().uuid(),
});

// ============================================
// AI Schema
// ============================================

export const AIChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z
    .string()
    .trim()
    .min(1, "Сообщение не может быть пустым")
    .max(4000, "Сообщение слишком длинное (макс. 4000 символов)"),
});

export const AIChatSchema = z.object({
  messages: z
    .array(AIChatMessageSchema)
    .min(1, "Требуется хотя бы одно сообщение")
    .max(20, "Превышено максимальное число сообщений в истории (макс. 20)"),
  provider: z.literal("local").optional(),
});

// ============================================
// Verification Schema
// ============================================

export const VerificationRequestSchema = z.object({
  subjectType: z.enum(["profile", "property"]),
  subjectId: z.string().uuid(),
  provider: z.string().optional(),
  documentType: z
    .enum(["passport", "income", "rental_history", "property_deed"])
    .optional(),
});

// ============================================
// Type Exports
// ============================================

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type ProfilePreferencesInput = z.infer<typeof ProfilePreferencesSchema>;
export type LifestyleAnswerInput = z.infer<typeof LifestyleAnswerSchema>;
export type CompatibilityWeightsInput = z.infer<
  typeof CompatibilityWeightsSchema
>;

export type PropertyCreateInput = z.infer<typeof PropertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof PropertyUpdateSchema>;
export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;

export type GroupCreateInput = z.infer<typeof GroupCreateSchema>;
export type GroupInviteInput = z.infer<typeof GroupInviteSchema>;
export type GroupMemberUpdateInput = z.infer<typeof GroupMemberUpdateSchema>;

export type ApplicationCreateInput = z.infer<typeof ApplicationCreateSchema>;
export type ApplicationStatusInput = z.infer<typeof ApplicationStatusSchema>;
export type ApplicationMemberConfirmInput = z.infer<
  typeof ApplicationMemberConfirmSchema
>;

export type MessageSendInput = z.infer<typeof MessageSendSchema>;
export type PollVoteInput = z.infer<typeof PollVoteSchema>;
export type ViewingStatusInput = z.infer<typeof ViewingStatusSchema>;
export type ChatExpensePaidInput = z.infer<typeof ChatExpensePaidSchema>;
export type ThreadPinInput = z.infer<typeof ThreadPinSchema>;
export type MessageReactionInput = z.infer<typeof MessageReactionSchema>;

export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>;
export type ExpensePaidInput = z.infer<typeof ExpensePaidSchema>;

export type ChoreCreateInput = z.infer<typeof ChoreCreateSchema>;
export type ChoreUpdateInput = z.infer<typeof ChoreUpdateSchema>;

export type FavoriteToggleInput = z.infer<typeof FavoriteToggleSchema>;

export type AIChatInput = z.infer<typeof AIChatSchema>;

export type VerificationRequestInput = z.infer<
  typeof VerificationRequestSchema
>;

// ============================================
// Validation Helper
// ============================================

/**
 * Validates input against a schema and returns typed data or throws formatted error
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  actionName: string,
): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`[${actionName}] Validation failed: ${errors}`);
  }

  return result.data;
}

/**
 * Validates input and returns { data, error } tuple (no throw)
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): { data: T | null; error: string | null } {
  const result = schema.safeParse(input);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return { data: null, error: errors };
  }

  return { data: result.data, error: null };
}
