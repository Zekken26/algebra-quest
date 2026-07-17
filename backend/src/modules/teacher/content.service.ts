import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsSection } from "./teacher.ownership";
import type { ContentType, ActivityType } from "@prisma/client";

const contentTypeToActivityType: Record<ContentType, ActivityType> = {
  ASSIGNMENT: "ASSIGNMENT",
  PRETEST: "PRE_TEST",
  ASSESSMENT: "ASSESSMENT",
};

function resolveSectionId(input: { classId?: string | null; sectionId?: string | null }) {
  if (input.classId && input.sectionId && input.classId !== input.sectionId) {
    throw new AppError("classId and sectionId must refer to the same section.", 400, "SECTION_ID_CONFLICT");
  }
  return input.sectionId ?? input.classId;
}

export async function createContent(
  teacherId: string,
  input: {
    title: string;
    type: ContentType;
    description?: string | null;
    instructions?: string;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    submissionType?: string;
    timeLimitMinutes?: number | null;
    isPublished?: boolean;
    classId?: string | null;
    sectionId?: string | null;
    questions: Array<{
      equation: string;
      choices: string[];
      correctAnswer: string;
      explanation: string;
      points?: number;
      difficulty?: string;
      imageUrl?: string | null;
    }>;
  },
) {
  const sectionId = resolveSectionId(input);
  if (!sectionId) throw new AppError("sectionId or classId is required.", 400, "SECTION_REQUIRED");
  await assertTeacherOwnsSection(teacherId, sectionId);

  const result = await prisma.$transaction(async (tx) => {
    const content = await tx.classContent.create({
      data: {
        title: input.title,
        type: input.type,
        description: input.description ?? null,
        instructions: input.instructions ?? "",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
        availableTo: input.availableTo ? new Date(input.availableTo) : null,
        submissionType: input.submissionType ?? "quiz",
        timeLimitMinutes: input.timeLimitMinutes ?? null,
        isPublished: input.isPublished ?? false,
        teacherId,
        sectionId,
        questions: {
          create: input.questions.map((q) => ({
            equation: q.equation,
            choices: q.choices,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points ?? 1,
            difficulty: q.difficulty ?? "Medium",
            imageUrl: q.imageUrl ?? null,
          })),
        },
      },
    });

    const maxOrderIndex = await tx.activity.aggregate({
      where: { sectionId },
      _max: { orderIndex: true },
    });

    await tx.activity.create({
      data: {
        type: contentTypeToActivityType[input.type],
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
        availableTo: input.availableTo ? new Date(input.availableTo) : null,
        totalPoints: null,
        isPublished: input.isPublished ?? false,
        orderIndex: (maxOrderIndex._max.orderIndex ?? -1) + 1,
        teacherId,
        sectionId,
        contentId: content.id,
      },
    });

    return tx.classContent.findUniqueOrThrow({
      where: { id: content.id },
      include: { questions: true },
    });
  });

  return result;
}

export async function updateContent(
  teacherId: string,
  contentId: string,
  input: {
    title?: string;
    description?: string | null;
    instructions?: string;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    submissionType?: string;
    timeLimitMinutes?: number | null;
    isPublished?: boolean;
    questions?: Array<{
      equation: string;
      choices: string[];
      correctAnswer: string;
      explanation: string;
      points?: number;
      difficulty?: string;
      imageUrl?: string | null;
    }>;
  },
) {
  const existing = await prisma.classContent.findUnique({
    where: { id: contentId },
    select: { id: true, teacherId: true, sectionId: true },
  });

  if (!existing) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's content.", 403, "CONTENT_FORBIDDEN");

  if (input.questions) {
    await prisma.contentQuestion.deleteMany({ where: { contentId } });
    await prisma.contentQuestion.createMany({
      data: input.questions.map((q) => ({
        contentId,
        equation: q.equation,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points ?? 1,
        difficulty: q.difficulty ?? "Medium",
        imageUrl: q.imageUrl ?? null,
      })),
    });
  }

  const content = await prisma.classContent.update({
    where: { id: contentId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.instructions !== undefined ? { instructions: input.instructions } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
      ...(input.availableFrom !== undefined ? { availableFrom: input.availableFrom ? new Date(input.availableFrom) : null } : {}),
      ...(input.availableTo !== undefined ? { availableTo: input.availableTo ? new Date(input.availableTo) : null } : {}),
      ...(input.submissionType !== undefined ? { submissionType: input.submissionType } : {}),
      ...(input.timeLimitMinutes !== undefined ? { timeLimitMinutes: input.timeLimitMinutes } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
    },
    include: { questions: true },
  });

  return content;
}

export async function deleteContent(teacherId: string, contentId: string) {
  const existing = await prisma.classContent.findUnique({
    where: { id: contentId },
    select: { id: true, teacherId: true },
  });

  if (!existing) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot delete another teacher's content.", 403, "CONTENT_FORBIDDEN");

  await prisma.classContent.delete({ where: { id: contentId } });
}

export async function getSectionContent(teacherId: string, sectionId: string, type?: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const where: Record<string, unknown> = { sectionId };
  if (type) where.type = type;

  const content = await prisma.classContent.findMany({
    where,
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return content;
}

export async function getContentDetail(teacherId: string, contentId: string) {
  const content = await prisma.classContent.findUnique({
    where: { id: contentId },
    include: {
      questions: true,
      attempts: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!content) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");
  if (content.teacherId !== teacherId) throw new AppError("You cannot view another teacher's content.", 403, "CONTENT_FORBIDDEN");

  return content;
}
