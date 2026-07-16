import { z } from "zod";
import { ActivityType } from "@prisma/client";

export const assignmentIdParamsSchema = z.object({
  assignmentId: z.string().trim().min(1),
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(10000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  submissionType: z.enum(["FILE_UPLOAD", "ESSAY", "SHORT_ANSWER", "MULTIPLE_CHOICE", "ATTACHMENTS"]).optional(),
  passingScore: z.coerce.number().int().nonnegative().nullable().optional(),
  isPublished: z.boolean().default(false),
  classId: z.string().trim().min(1).nullable().optional(),
  sectionId: z.string().trim().min(1).nullable().optional(),
  questions: z.array(z.object({
    equation: z.string().min(1),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "SHORT_ANSWER", "ESSAY"]).default("MULTIPLE_CHOICE"),
    choices: z.array(z.string()).default([]),
    correctAnswer: z.string().min(1),
    explanation: z.string().default(""),
    points: z.number().int().nonnegative().default(1),
    difficulty: z.string().default("Medium"),
  })).default([]),
});

export const updateAssignmentSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  instructions: z.string().trim().max(10000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableTo: z.string().datetime().nullable().optional(),
  totalPoints: z.coerce.number().int().nonnegative().max(10000).nullable().optional(),
  submissionType: z.enum(["FILE_UPLOAD", "ESSAY", "SHORT_ANSWER", "MULTIPLE_CHOICE", "ATTACHMENTS"]).optional(),
  passingScore: z.coerce.number().int().nonnegative().nullable().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(z.object({
    equation: z.string().min(1),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "SHORT_ANSWER", "ESSAY"]).default("MULTIPLE_CHOICE"),
    choices: z.array(z.string()).default([]),
    correctAnswer: z.string().min(1),
    explanation: z.string().default(""),
    points: z.number().int().nonnegative().default(1),
    difficulty: z.string().default("Medium"),
  })).optional(),
});

export const assignmentQuerySchema = z.object({
  sectionId: z.string().trim().min(1).optional(),
});
