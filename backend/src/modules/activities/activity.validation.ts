import { z } from "zod";

export const activityTypeEnum = z.enum(["QUEST", "ASSIGNMENT", "PRE_TEST", "ASSESSMENT"]);

const optionalId = z.string().trim().min(1).nullable().optional();

export const activityIdParamsSchema = z.object({
  activityId: z.string().trim().min(1),
});

export const classIdParamsSchema = z.object({
  classId: z.string().trim().min(1),
});

export const createActivitySchema = z.object({
  type: activityTypeEnum,
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(5000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  isPublished: z.boolean().default(false),
  classId: optionalId,
  sectionId: optionalId,
});

export const updateActivitySchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(5000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  isPublished: z.boolean().optional(),
});

export const activityQuerySchema = z.object({
  type: activityTypeEnum.optional(),
});
