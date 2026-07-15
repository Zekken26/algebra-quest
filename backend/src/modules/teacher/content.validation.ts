import { z } from "zod";

const optionalId = z.string().trim().min(1).nullable().optional();

export const contentIdParamsSchema = z.object({
  contentId: z.string().trim().min(1),
});

export const contentTypeEnum = z.enum(["ASSIGNMENT", "PRETEST", "ASSESSMENT"]);

const baseContentQuestionSchema = z.object({
  equation: z.string().trim().max(1000).default(""),
  choices: z.array(z.string().trim().min(1).max(500)).length(4),
  correctAnswer: z.string().trim().min(1).max(500),
  explanation: z.string().trim().max(2000).default(""),
  points: z.coerce.number().int().nonnegative().max(100).default(1),
  difficulty: z.string().trim().min(1).max(80).optional(),
  imageUrl: z.string().trim().optional().nullable(),
});

export const contentQuestionSchema = baseContentQuestionSchema.superRefine((value, ctx) => {
  const normalizedChoices = value.choices.map((choice) => choice.trim().toLowerCase());
  if (!normalizedChoices.includes(value.correctAnswer.trim().toLowerCase())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["correctAnswer"],
      message: "correctAnswer must match one of the choices.",
    });
  }
});

export const createContentSchema = z.object({
  title: z.string().trim().min(2).max(160),
  type: contentTypeEnum,
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(5000).default(""),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  submissionType: z.string().trim().min(1).max(20).optional(),
  timeLimitMinutes: z.coerce.number().int().nonnegative().max(180).nullable().optional(),
  isPublished: z.boolean().default(false),
  classId: optionalId,
  sectionId: optionalId,
  questions: z.array(contentQuestionSchema).min(1).max(100),
});

export const updateContentSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(5000).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  submissionType: z.string().trim().min(1).max(20).optional(),
  timeLimitMinutes: z.coerce.number().int().nonnegative().max(180).nullable().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(contentQuestionSchema).min(1).max(100).optional(),
});

export const contentQuerySchema = z.object({
  sectionId: z.string().trim().min(1).optional(),
  type: contentTypeEnum.optional(),
});
