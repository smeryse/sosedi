/**
 * Zod Validation Schemas for all Server Actions
 * Every Server Action input must be validated through these schemas
 */

import { z } from "zod";

// ============================================
// AUTH SCHEMAS
// ============================================

export const signUpSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  confirmPassword: z.string(),
  displayName: z.string().min(2, "Имя должно содержать минимум 2 символа").max(80),
  role: z.enum(["tenant", "owner"]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Введите пароль"),
  redirectTo: z.string().url().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Неверный формат email"),
  redirectTo: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

// ============================================
// PROFILE & ONBOARDING SCHEMAS
// ============================================

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  age: z.number().int().min(18).max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  avatarPath: z.string().optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  moveInDate: z.string().date().optional(),
  leaseMonths: z.number().int().min(1).max(120).optional(),
  isPublic: z.boolean().optional(),
});

export const lifestyleAnswerSchema = z.object({
  questionKey: z.string().min(1),
  answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  importance: z.number().int().min(1).max(5).default(3),
});

export const compatibilityWeightsSchema = z.object({
  criterion: z.string(),
  weight: z.number().min(0).max(1),
});

// ============================================
// PROPERTY SCHEMAS
// ============================================

export const propertyCreateSchema = z.object({
  title: z.string().min(4).max(160),
  description: z.string().max(5000).optional(),
  city: z.string().min(1).max(100).default("Краснодар"),
  district: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
  monthlyRent: z.number().int().positive(),
  deposit: z.number().int().min(0).default(0),
  rooms: z.number().int().min(1).max(20),
  area: z.number().positive(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  availableFrom: z.string().date().optional(),
  leaseMonthsMin: z.number().int().min(1).max(120).default(6),
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  rules: z.record(z.string(), z.string()).default({}),
  images: z.array(z.object({
    storagePath: z.string(),
    altText: z.string().optional(),
    sortOrder: z.number().int().min(0).default(0),
  })).optional(),
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertyFiltersSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  districts: z.array(z.string()).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  rooms: z.array(z.number().int().min(1)).optional(),
  rentalTerm: z.string().optional(),
  petsAllowed: z.boolean().optional(),
  furnished: z.boolean().optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest", "match"]).default("match"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const propertyImageSchema = z.object({
  storagePath: z.string(),
  altText: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// ============================================
// GROUP SCHEMAS
// ============================================

export const groupCreateSchema = z.object({
  name: z.string().min(2).max(100),
  targetBudget: z.number().int().positive().optional(),
  moveInDate: z.string().date().optional(),
  leaseMonths: z.number().int().min(1).max(120).optional(),
});

export const groupUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  targetBudget: z.number().int().positive().optional(),
  moveInDate: z.string().date().optional(),
  leaseMonths: z.number().int().min(1).max(120).optional(),
  status: z.enum(["forming", "ready", "application_sent", "under_review", "needs_response", "approved", "rejected", "settled"]).optional(),
});

export const groupInviteSchema = z.object({
  groupId: z.string().uuid(),
  inviteeId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(),
});

// ============================================
// APPLICATION SCHEMAS
// ============================================

export const applicationCreateSchema = z.object({
  groupId: z.string().uuid(),
  propertyId: z.string().uuid(),
  totalBudget: z.number().int().positive(),
  moveInDate: z.string().date().optional(),
  leaseMonths: z.number().int().min(1).max(120).optional(),
  memberShares: z.array(z.object({
    profileId: z.string().uuid(),
    rentShare: z.number().int().min(0),
  })).min(1),
});

export const applicationUpdateSchema = z.object({
  status: z.enum(["draft", "submitted", "reviewing", "needs_response", "approved", "rejected", "contract_agreed", "settled"]).optional(),
  totalBudget: z.number().int().positive().optional(),
  moveInDate: z.string().date().optional(),
  leaseMonths: z.number().int().min(1).max(120).optional(),
  ownerNote: z.string().optional(),
});

export const applicationMemberConfirmSchema = z.object({
  applicationId: z.string().uuid(),
  confirmed: z.boolean(),
});

// ============================================
// MESSAGE SCHEMAS
// ============================================

export const messageSendSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  type: z.enum(["text", "property_card", "system_notice", "attachment", "viewing_request", "poll", "expense_split", "voice", "ai_bot"]).default("text"),
  propertyId: z.string().uuid().optional(),
  viewingData: z.object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    date: z.string(),
    timeSlot: z.string(),
    status: z.enum(["pending", "confirmed", "rescheduled", "declined"]),
    requestedBy: z.enum(["tenant", "owner"]),
  }).optional(),
  pollData: z.object({
    id: z.string().uuid(),
    question: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      voterIds: z.array(z.string()).default([]),
    })),
    totalVotes: z.number().int().default(0),
  }).optional(),
  expenseData: z.object({
    id: z.string().uuid(),
    title: z.string(),
    totalAmount: z.number().int().positive(),
    shares: z.array(z.object({
      memberId: z.string(),
      memberName: z.string(),
      amount: z.number(),
      isPaid: z.boolean(),
    })),
  }).optional(),
  voiceDuration: z.string().optional(),
  attachments: z.array(z.object({
    storagePath: z.string(),
    mimeType: z.string(),
    byteSize: z.number().int().positive(),
  })).optional(),
}).refine((data) => {
  // Poll messages must have pollData
  if (data.type === "poll" && !data.pollData) return false;
  // Expense split messages must have expenseData
  if (data.type === "expense_split" && !data.expenseData) return false;
  // Viewing requests must have viewingData
  if (data.type === "viewing_request" && !data.viewingData) return false;
  return true;
}, {
  message: "Structured message type requires corresponding data field",
});

export const pollVoteSchema = z.object({
  threadId: z.string().uuid(),
  messageId: z.string().uuid(),
  optionId: z.string(),
});

export const viewingStatusSchema = z.object({
  threadId: z.string().uuid(),
  messageId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "rescheduled", "declined"]),
});

// ============================================
// BUDGET / EXPENSE SCHEMAS
// ============================================

export const expenseCreateSchema = z.object({
  groupId: z.string().uuid(),
  category: z.enum(["rent", "utilities", "deposit", "household", "other"]),
  description: z.string().min(2).max(200),
  amount: z.number().int().positive(),
  occurredOn: z.string().date().default(() => new Date().toISOString().split("T")[0]),
  shares: z.array(z.object({
    profileId: z.string().uuid(),
    share: z.number().int().min(0),
  })).min(1),
});

export const expenseUpdateSchema = z.object({
  category: z.enum(["rent", "utilities", "deposit", "household", "other"]).optional(),
  description: z.string().min(2).max(200).optional(),
  amount: z.number().int().positive().optional(),
  shares: z.array(z.object({
    profileId: z.string().uuid(),
    share: z.number().int().min(0),
    paidAt: z.string().datetime().optional(),
  })).optional(),
});

export const expensePaidToggleSchema = z.object({
  expenseId: z.string().uuid(),
  memberId: z.string().uuid(),
});

// ============================================
// CHORE SCHEMAS
// ============================================

export const choreCreateSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(2).max(160),
  zone: z.string().max(100).optional(),
  assigneeId: z.string().uuid().optional(),
  dueAt: z.string().datetime().optional(),
  recurrence: z.string().optional(), // cron expression
});

export const choreUpdateSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  zone: z.string().max(100).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  recurrence: z.string().nullable().optional(),
  status: z.enum(["open", "done", "skipped"]).optional(),
});

export const choreDoneToggleSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// FAVORITE SCHEMAS
// ============================================

export const favoriteToggleSchema = z.object({
  type: z.enum(["profile", "property", "group"]),
  id: z.string().uuid(),
});

// ============================================
// AI SCHEMAS
// ============================================

export const aiChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string().min(1).max(8000),
  })).min(1).max(50),
  provider: z.enum(["mock", "groq", "openrouter"]).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.3),
  tools: z.array(z.object({
    name: z.string(),
    parameters: z.record(z.string(), z.unknown()),
  })).optional(),
});

export const aiToolCallSchema = z.object({
  name: z.string(),
  arguments: z.record(z.string(), z.unknown()),
});

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const notificationCreateSchema = z.object({
  userId: z.string().uuid(),
  kind: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  href: z.string().url().optional(),
});

export const notificationReadSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// VERIFICATION SCHEMAS
// ============================================

export const verificationSubmitSchema = z.object({
  subjectType: z.enum(["profile", "property"]),
  subjectId: z.string().uuid(),
  type: z.enum(["identity", "income", "rental_history"]),
  documents: z.array(z.object({
    storagePath: z.string(),
    mimeType: z.string(),
    fileName: z.string(),
  })).min(1).max(5),
});

// ============================================
// SEARCH / FILTER SCHEMAS
// ============================================

export const roommateSearchSchema = z.object({
  query: z.string().optional(),
  ageMin: z.number().int().min(18).optional(),
  ageMax: z.number().int().max(100).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  districts: z.array(z.string()).optional(),
  moveInDate: z.string().date().optional(),
  leaseMonths: z.number().int().min(1).optional(),
  smoking: z.enum(["no", "sometimes", "yes", "indifferent"]).optional(),
  pets: z.enum(["no", "cat", "dog", "other", "indifferent"]).optional(),
  sleepSchedule: z.enum(["early", "late", "flexible"]).optional(),
  noiseTolerance: z.number().int().min(1).max(5).optional(),
  guestsFrequency: z.enum(["never", "rarely", "sometimes", "often"]).optional(),
  remoteWork: z.enum(["never", "sometimes", "often"]).optional(),
  cleanliness: z.number().int().min(1).max(5).optional(),
  minCompatibility: z.number().int().min(0).max(100).optional(),
  sortBy: z.enum(["compatibility", "budget", "age", "newest"]).default("compatibility"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate data against schema and throw formatted error
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Validate and throw if invalid
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${message}`);
  }
  return result.data;
}

/**
 * Create a Server Action wrapper with automatic validation
 */
export function withValidation<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>
) {
  return async (rawInput: unknown): Promise<{ data: TOutput | null; error: string | null }> => {
    try {
      const validated = validateOrThrow(schema, rawInput);
      const data = await handler(validated);
      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { data: null, error: message };
    }
  };
}

// Export all schemas as a single object for easy importing
export const schemas = {
  auth: {
    signUp: signUpSchema,
    signIn: signInSchema,
    forgotPassword: forgotPasswordSchema,
    updatePassword: updatePasswordSchema,
  },
  profile: {
    update: profileUpdateSchema,
    lifestyleAnswer: lifestyleAnswerSchema,
    compatibilityWeights: compatibilityWeightsSchema,
  },
  property: {
    create: propertyCreateSchema,
    update: propertyUpdateSchema,
    filters: propertyFiltersSchema,
    image: propertyImageSchema,
  },
  group: {
    create: groupCreateSchema,
    update: groupUpdateSchema,
    invite: groupInviteSchema,
  },
  application: {
    create: applicationCreateSchema,
    update: applicationUpdateSchema,
    memberConfirm: applicationMemberConfirmSchema,
  },
  message: {
    send: messageSendSchema,
    pollVote: pollVoteSchema,
    viewingStatus: viewingStatusSchema,
  },
  budget: {
    expenseCreate: expenseCreateSchema,
    expenseUpdate: expenseUpdateSchema,
    expensePaidToggle: expensePaidToggleSchema,
  },
  chore: {
    create: choreCreateSchema,
    update: choreUpdateSchema,
    doneToggle: choreDoneToggleSchema,
  },
  favorite: {
    toggle: favoriteToggleSchema,
  },
  ai: {
    chat: aiChatSchema,
    toolCall: aiToolCallSchema,
  },
  notification: {
    create: notificationCreateSchema,
    read: notificationReadSchema,
  },
  verification: {
    submit: verificationSubmitSchema,
  },
  search: {
    roommates: roommateSearchSchema,
  },
};
