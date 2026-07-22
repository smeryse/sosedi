/**
 * Canonical Validation Schemas Module
 * Re-exports all schemas from lib/validators/schemas.ts to maintain a single source of truth.
 */

export * from "@/lib/validators/schemas";

import {
  SignUpSchema,
  SignInSchema,
  ForgotPasswordSchema,
  UpdatePasswordSchema,
  ProfileUpdateSchema,
  ProfilePreferencesSchema,
  LifestyleAnswerSchema,
  CompatibilityWeightsSchema,
  PropertyCreateSchema,
  PropertyUpdateSchema,
  PropertyFiltersSchema,
  GroupCreateSchema,
  GroupInviteSchema,
  GroupMemberUpdateSchema,
  ApplicationCreateSchema,
  ApplicationStatusSchema,
  ApplicationMemberConfirmSchema,
  MessageSendSchema,
  PollVoteSchema,
  ViewingStatusSchema,
  ChatExpensePaidSchema,
  ThreadPinSchema,
  MessageReactionSchema,
  ExpenseCreateSchema,
  ExpensePaidSchema,
  ChoreCreateSchema,
  ChoreUpdateSchema,
  FavoriteToggleSchema,
  AIChatSchema,
  AIChatMessageSchema,
  VerificationRequestSchema,
} from "@/lib/validators/schemas";

// Compatibility Aliases (camelCase aliases for pascalCase schemas)
export const signUpSchema = SignUpSchema;
export const signInSchema = SignInSchema;
export const forgotPasswordSchema = ForgotPasswordSchema;
export const updatePasswordSchema = UpdatePasswordSchema;
export const profileUpdateSchema = ProfileUpdateSchema;
export const profilePreferencesSchema = ProfilePreferencesSchema;
export const lifestyleAnswerSchema = LifestyleAnswerSchema;
export const compatibilityWeightsSchema = CompatibilityWeightsSchema;

export const propertyCreateSchema = PropertyCreateSchema;
export const propertyUpdateSchema = PropertyUpdateSchema;
export const propertyFiltersSchema = PropertyFiltersSchema;

export const groupCreateSchema = GroupCreateSchema;
export const groupInviteSchema = GroupInviteSchema;
export const groupMemberUpdateSchema = GroupMemberUpdateSchema;

export const applicationCreateSchema = ApplicationCreateSchema;
export const applicationStatusSchema = ApplicationStatusSchema;
export const applicationMemberConfirmSchema = ApplicationMemberConfirmSchema;

export const messageSendSchema = MessageSendSchema;
export const pollVoteSchema = PollVoteSchema;
export const viewingStatusSchema = ViewingStatusSchema;
export const chatExpensePaidSchema = ChatExpensePaidSchema;
export const threadPinSchema = ThreadPinSchema;
export const messageReactionSchema = MessageReactionSchema;

export const expenseCreateSchema = ExpenseCreateSchema;
export const expensePaidSchema = ExpensePaidSchema;

export const choreCreateSchema = ChoreCreateSchema;
export const choreUpdateSchema = ChoreUpdateSchema;

export const favoriteToggleSchema = FavoriteToggleSchema;

export const aiChatSchema = AIChatSchema;
export const aiChatMessageSchema = AIChatMessageSchema;

export const verificationRequestSchema = VerificationRequestSchema;
