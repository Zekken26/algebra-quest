import { z } from "zod";

export const assessmentIdParamsSchema = z.object({
  assessmentId: z.string().trim().min(1),
});

export const createAssessmentSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(10000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  timeLimitMinutes: z.coerce.number().int().positive().nullable().optional(),
  passingScore: z.coerce.number().int().nonnegative().nullable().optional(),
  attemptsAllowed: z.coerce.number().int().positive().default(1),
  autoGrade: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  shuffleChoices: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  classId: z.string().trim().min(1).nullable().optional(),
  sectionId: z.string().trim().min(1).nullable().optional(),
  questions: z.array(z.object({
    equation: z.string().min(1),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "ESSAY", "SHORT_ANSWER"]).default("MULTIPLE_CHOICE"),
    choices: z.array(z.string()).default([]),
    correctAnswer: z.string().min(1),
    explanation: z.string().default(""),
    points: z.number().int().nonnegative().default(1),
    difficulty: z.string().default("Medium"),
  })).default([]),
});

export const updateAssessmentSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(10000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  timeLimitMinutes: z.coerce.number().int().positive().nullable().optional(),
  passingScore: z.coerce.number().int().nonnegative().nullable().optional(),
  attemptsAllowed: z.coerce.number().int().positive().optional(),
  autoGrade: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleChoices: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(z.object({
    equation: z.string().min(1),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "ESSAY", "SHORT_ANSWER"]).default("MULTIPLE_CHOICE"),
    choices: z.array(z.string()).default([]),
    correctAnswer: z.string().min(1),
    explanation: z.string().default(""),
    points: z.number().int().nonnegative().default(1),
    difficulty: z.string().default("Medium"),
  })).optional(),
});

export const assessmentQuerySchema = z.object({
  sectionId: z.string().trim().min(1).optional(),
});
