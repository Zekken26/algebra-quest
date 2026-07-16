import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsSection } from "../teacher/teacher.ownership";
import type { Prisma } from "@prisma/client";

const assignmentInclude = {
  questions: true,
  _count: { select: { questions: true, attempts: true } },
};

export async function createAssignment(
  teacherId: string,
  input: {
    title: string;
    description?: string | null;
    instructions?: string | null;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    totalPoints?: number | null;
    submissionType?: string;
    passingScore?: number | null;
    isPublished?: boolean;
    classId?: string | null;
    sectionId?: string | null;
    questions?: Array<{
      equation: string;
      questionType?: string;
      choices: string[];
      correctAnswer: string;
      explanation: string;
      points?: number;
      difficulty?: string;
    }>;
  },
) {
  const sectionId = input.sectionId ?? input.classId;
  if (!sectionId) throw new AppError("sectionId or classId is required.", 400, "SECTION_REQUIRED");
  await assertTeacherOwnsSection(teacherId, sectionId);

  const content = await prisma.classContent.create({
    data: {
      title: input.title,
      type: "ASSIGNMENT",
      description: input.description ?? null,
      instructions: input.instructions ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
      availableTo: input.availableTo ? new Date(input.availableTo) : null,
      maxScore: input.totalPoints ?? null,
      submissionType: input.submissionType ?? null,
      passingScore: input.passingScore ?? null,
      isPublished: input.isPublished ?? false,
      teacherId,
      sectionId,
      questions: input.questions?.length ? {
        create: input.questions.map((q) => ({
          equation: q.equation,
          questionType: (q.questionType as any) ?? "MULTIPLE_CHOICE",
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points ?? 1,
          difficulty: q.difficulty ?? "Medium",
        })),
      } : undefined,
    },
    include: assignmentInclude,
  });

  return content;
}

export async function getAssignments(teacherId: string, sectionId?: string) {
  const where: Prisma.ClassContentWhereInput = { type: "ASSIGNMENT" };
  if (sectionId) {
    await assertTeacherOwnsSection(teacherId, sectionId);
    where.sectionId = sectionId;
  }

  const assignments = await prisma.classContent.findMany({
    where,
    include: assignmentInclude,
    orderBy: { createdAt: "desc" },
  });

  return assignments;
}

export async function getAssignmentDetail(teacherId: string, assignmentId: string) {
  const assignment = await prisma.classContent.findUnique({
    where: { id: assignmentId },
    include: { ...assignmentInclude, attempts: { include: { student: { select: { id: true, name: true, email: true } } }, orderBy: { startedAt: "desc" } } },
  });

  if (!assignment) throw new AppError("Assignment was not found.", 404, "ASSIGNMENT_NOT_FOUND");
  if (assignment.type !== "ASSIGNMENT") throw new AppError("Not an assignment.", 400, "INVALID_TYPE");
  if (assignment.teacherId !== teacherId) throw new AppError("You cannot view another teacher's assignment.", 403, "ASSIGNMENT_FORBIDDEN");

  return assignment;
}

export async function updateAssignment(
  teacherId: string,
  assignmentId: string,
  input: {
    title?: string;
    description?: string | null;
    instructions?: string | null;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    totalPoints?: number | null;
    submissionType?: string;
    passingScore?: number | null;
    isPublished?: boolean;
    questions?: Array<{
      equation: string;
      questionType?: string;
      choices: string[];
      correctAnswer: string;
      explanation: string;
      points?: number;
      difficulty?: string;
    }>;
  },
) {
  const existing = await prisma.classContent.findUnique({
    where: { id: assignmentId },
    select: { id: true, teacherId: true, type: true },
  });

  if (!existing) throw new AppError("Assignment was not found.", 404, "ASSIGNMENT_NOT_FOUND");
  if (existing.type !== "ASSIGNMENT") throw new AppError("Not an assignment.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's assignment.", 403, "ASSIGNMENT_FORBIDDEN");

  if (input.questions) {
    await prisma.contentQuestion.deleteMany({ where: { contentId: assignmentId } });
    if (input.questions.length > 0) {
      await prisma.contentQuestion.createMany({
        data: input.questions.map((q) => ({
          contentId: assignmentId,
          equation: q.equation,
          questionType: (q.questionType as any) ?? "MULTIPLE_CHOICE",
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points ?? 1,
          difficulty: q.difficulty ?? "Medium",
        })),
      });
    }
  }

  const data: any = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.instructions !== undefined) data.instructions = input.instructions;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.availableFrom !== undefined) data.availableFrom = input.availableFrom ? new Date(input.availableFrom) : null;
  if (input.availableTo !== undefined) data.availableTo = input.availableTo ? new Date(input.availableTo) : null;
  if (input.totalPoints !== undefined) data.maxScore = input.totalPoints;
  if (input.submissionType !== undefined) data.submissionType = input.submissionType;
  if (input.passingScore !== undefined) data.passingScore = input.passingScore;
  if (input.isPublished !== undefined) data.isPublished = input.isPublished;

  const assignment = await prisma.classContent.update({
    where: { id: assignmentId },
    data,
    include: assignmentInclude,
  });

  return assignment;
}

export async function deleteAssignment(teacherId: string, assignmentId: string) {
  const existing = await prisma.classContent.findUnique({
    where: { id: assignmentId },
    select: { id: true, teacherId: true, type: true },
  });

  if (!existing) throw new AppError("Assignment was not found.", 404, "ASSIGNMENT_NOT_FOUND");
  if (existing.type !== "ASSIGNMENT") throw new AppError("Not an assignment.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot delete another teacher's assignment.", 403, "ASSIGNMENT_FORBIDDEN");

  await prisma.classContent.delete({ where: { id: assignmentId } });
}

export async function togglePublishAssignment(teacherId: string, assignmentId: string) {
  const existing = await prisma.classContent.findUnique({
    where: { id: assignmentId },
    select: { id: true, teacherId: true, type: true, isPublished: true },
  });

  if (!existing) throw new AppError("Assignment was not found.", 404, "ASSIGNMENT_NOT_FOUND");
  if (existing.type !== "ASSIGNMENT") throw new AppError("Not an assignment.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's assignment.", 403, "ASSIGNMENT_FORBIDDEN");

  return prisma.classContent.update({
    where: { id: assignmentId },
    data: { isPublished: !existing.isPublished },
    include: assignmentInclude,
  });
}

export async function duplicateAssignment(teacherId: string, assignmentId: string) {
  const original = await getAssignmentDetail(teacherId, assignmentId);

  const { id, createdAt, updatedAt, ...rest } = original as any;
  const questions = original.questions?.map((q: any) => {
    const { id: qId, contentId, ...qRest } = q;
    return qRest;
  }) ?? [];

  return createAssignment(teacherId, {
    title: `${rest.title} (Copy)`,
    description: rest.description,
    instructions: rest.instructions,
    dueDate: rest.dueDate?.toISOString() ?? null,
    availableFrom: rest.availableFrom?.toISOString() ?? null,
    availableTo: rest.availableTo?.toISOString() ?? null,
    totalPoints: rest.maxScore,
    submissionType: rest.submissionType,
    passingScore: rest.passingScore,
    isPublished: false,
    sectionId: rest.sectionId,
    questions: questions.map((q: any) => ({
      equation: q.equation,
      questionType: q.questionType,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
      difficulty: q.difficulty,
    })),
  });
}
