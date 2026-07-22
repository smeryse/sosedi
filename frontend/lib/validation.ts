import { z } from "zod";

export const groupInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  targetBudget: z.number().int().positive(),
  moveInDate: z.string().date(),
});

export const applicationInputSchema = z.object({
  propertyId: z.string().min(1),
  groupId: z.string().min(1),
  message: z.string().trim().min(10).max(2000).optional(),
});
