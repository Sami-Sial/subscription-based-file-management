import { z } from "zod";

// ID param validation
export const idParamSchema = z.object({
  id: z.string().uuid("Invalid UUID"),
});

// CREATE SUBSCRIPTION validation
export const createSubscriptionSchema = z.object({
  name: z.string().min(2).max(50),

  maxFolders: z.number().int().positive(),
  maxNesting: z.number().int().min(0),

  allowedTypes: z.array(z.string().min(1)),

  maxFileSizeMB: z.number().int().positive(),
  totalFileLimit: z.number().int().positive(),
  filesPerFolder: z.number().int().positive(),
  priceMonthly: z.number().int().nonnegative(),
  isActive: z.enum([true, false]).optional(),
});

// UPDATE SUBSCRIPTION validation (all optional)
export const updateSubscriptionSchema = createSubscriptionSchema.partial();
