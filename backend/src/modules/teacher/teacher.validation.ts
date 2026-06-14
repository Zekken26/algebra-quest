import { z } from "zod";

const optionalId = z.string().trim().min(1).nullable().optional();

export const sectionIdParamsSchema = z.object({
  sectionId: z.string().trim().min(1),
});

export const studentIdParamsSchema = z.object({
  studentId: z.string().trim().min(1),
});

export const guideIdParamsSchema = z.object({
  guideId: z.string().trim().min(1),
});

export const questIdParamsSchema = z.object({
  questId: z.string().trim().min(1),
});

export const questionIdParamsSchema = z.object({
  questionId: z.string().trim().min(1),
});

export const createSectionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4,12}$/)
    .transform((value) => value.toUpperCase())
    .optional(),
});

export const updateSectionSchema = createSectionSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});

export const studentSearchQuerySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const addStudentSchema = z
  .object({
    studentId: z.string().trim().min(1).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
  })
  .refine((value) => value.studentId || value.email, {
    message: "studentId or email is required.",
  });

export const updateStudentGradeSchema = z.object({
  grade: z.coerce.number().min(0).max(100).nullable(),
});

export const guideQuerySchema = z.object({
  sectionId: z.string().trim().min(1).optional(),
});

export const guideSchema = z.object({
  title: z.string().trim().min(2).max(160),
  topic: z.string().trim().min(2).max(160),
  shortExplanation: z.string().trim().max(5000).default(""),
  exampleProblem: z.string().trim().max(1000).default(""),
  solutionSteps: z.array(z.string().trim().min(1).max(1000)).max(30).default([]),
  tips: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
  imageUrl: z.string().trim().optional().nullable(),
  classId: optionalId,
  sectionId: optionalId,
  questId: optionalId,
});

export const updateGuideSchema = guideSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});

const baseQuestionSchema = z.object({
  equation: z.string().trim().max(1000).default(""),
  choices: z.array(z.string().trim().min(1).max(500)).length(4),
  correctAnswer: z.string().trim().min(1).max(500),
  explanation: z.string().trim().max(2000).default(""),
  solutionSteps: z.array(z.string().trim().min(1).max(1000)).max(30).default([]),
  difficulty: z.string().trim().min(1).max(80).optional(),
  imageUrl: z.string().trim().optional().nullable(),
});

export const questionSchema = baseQuestionSchema.superRefine((value, ctx) => {
  const normalizedChoices = value.choices.map((choice) => choice.trim().toLowerCase());
  if (!normalizedChoices.includes(value.correctAnswer.trim().toLowerCase())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["correctAnswer"],
      message: "correctAnswer must match one of the choices.",
    });
  }
});

export const updateQuestionSchema = baseQuestionSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export const addQuestionsSchema = z
  .union([
    questionSchema,
    z.object({
      questions: z.array(questionSchema).min(1).max(50),
    }),
  ])
  .transform((value) => ("questions" in value ? value.questions : [value]));

export const questQuerySchema = z.object({
  sectionId: z.string().trim().min(1).optional(),
  guideId: z.string().trim().min(1).optional(),
});

export const questSchema = z.object({
  title: z.string().trim().min(2).max(160),
  worldName: z.string().trim().min(2).max(160),
  topic: z.string().trim().min(2).max(160),
  difficulty: z.string().trim().min(1).max(80),
  requiredPuzzlePieces: z.coerce.number().int().positive().max(100),
  maxHearts: z.coerce.number().int().positive().max(20).default(3),
  hintLimit: z.coerce.number().int().nonnegative().max(20).default(3),
  xpReward: z.coerce.number().int().nonnegative().max(100000).default(100),
  coinReward: z.coerce.number().int().nonnegative().max(100000).default(50),
  levelNumber: z.coerce.number().int().positive().max(10000),
  isPublished: z.boolean().default(false),
  classId: optionalId,
  sectionId: optionalId,
  guideId: optionalId,
  questions: z.array(questionSchema).max(50).default([]),
});

export const updateQuestSchema = questSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const analyticsQuerySchema = z.object({
  sectionId: z.string().trim().min(1).optional(),
  range: z.enum(["7d", "30d", "term"]).default("7d"),
});
