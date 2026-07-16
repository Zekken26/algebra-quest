import { z } from "zod";

export const preTestIdParamsSchema = z.object({
  preTestId: z.string().trim().min(1),
});

export const createPreTestSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(10000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  timeLimitMinutes: z.coerce.number().int().positive().nullable().optional(),
  passingScore: z.coerce.number().int().nonnegative().nullable().optional(),
  shuffleQuestions: z.boolean().default(false),
  shuffleChoices: z.boolean().default(false),
  attemptsAllowed: z.coerce.number().int().positive().default(1),
  showScoreImmediately: z.boolean().default(true),
  randomQuestions: z.coerce.number().int().positive().nullable().optional(),
  isPublished: z.boolean().default(false),
  classId: z.string().trim().min(1).nullable().optional(),
  sectionId: z.string().trim().min(1).nullable().optional(),
  questions: z.array(z.object({
    equation: z.string().min(1),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "MATCHING", "ENUMERATION", "SHORT_ANSWER"]).default("MULTIPLE_CHOICE"),
    choices: z.array(z.string()).default([]),
    correctAnswer: z.string().min(1),
    explanation: z.string().default(""),
    points: z.number().int().nonnegative().default(1),
    difficulty: z.string().default("Medium"),
    matchingPairs: z.array(z.object({ left: z.string(), right: z.string() })).nullable().optional(),
    enumerationItems: z.array(z.string()).default([]),
  })).default([]),
});

export const updatePreTestSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(10000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  timeLimitMinutes: z.coerce.number().int().positive().nullable().optional(),
  passingScore: z.coerce.number().int().nonnegative().nullable().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleChoices: z.boolean().optional(),
  attemptsAllowed: z.coerce.number().int().positive().optional(),
  showScoreImmediately: z.boolean().optional(),
  randomQuestions: z.coerce.number().int().positive().nullable().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(z.object({
    equation: z.string().min(1),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "MATCHING", "ENUMERATION", "SHORT_ANSWER"]).default("MULTIPLE_CHOICE"),
    choices: z.array(z.string()).default([]),
    correctAnswer: z.string().min(1),
    explanation: z.string().default(""),
    points: z.number().int().nonnegative().default(1),
    difficulty: z.string().default("Medium"),
    matchingPairs: z.array(z.object({ left: z.string(), right: z.string() })).nullable().optional(),
    enumerationItems: z.array(z.string()).default([]),
  })).optional(),
});

export const preTestQuerySchema = z.object({
  sectionId: z.string().trim().min(1).optional(),
});
