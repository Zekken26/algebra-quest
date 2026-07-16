import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsSection } from "../teacher/teacher.ownership";
import type { Prisma } from "@prisma/client";

const assessmentInclude = {
  questions: true,
  _count: { select: { questions: true, attempts: true } },
};

export async function createAssessment(
  teacherId: string,
  input: {
    title: string;
    description?: string | null;
    instructions?: string | null;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    totalPoints?: number | null;
    timeLimitMinutes?: number | null;
    passingScore?: number | null;
    attemptsAllowed?: number;
    autoGrade?: boolean;
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
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

  const result = await prisma.$transaction(async (tx) => {
    const content = await tx.classContent.create({
      data: {
        title: input.title,
        type: "ASSESSMENT",
        description: input.description ?? null,
        instructions: input.instructions ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
        availableTo: input.availableTo ? new Date(input.availableTo) : null,
        maxScore: input.totalPoints ?? null,
        timeLimitMinutes: input.timeLimitMinutes ?? null,
        passingScore: input.passingScore ?? null,
        attemptsAllowed: input.attemptsAllowed ?? 1,
        autoGrade: input.autoGrade ?? true,
        shuffleQuestions: input.shuffleQuestions ?? false,
        shuffleChoices: input.shuffleChoices ?? false,
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
    });

    const maxOrderIndex = await tx.activity.aggregate({
      where: { sectionId },
      _max: { orderIndex: true },
    });

    await tx.activity.create({
      data: {
        type: "ASSESSMENT",
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
        availableTo: input.availableTo ? new Date(input.availableTo) : null,
        totalPoints: input.totalPoints ?? null,
        isPublished: input.isPublished ?? false,
        orderIndex: (maxOrderIndex._max.orderIndex ?? -1) + 1,
        teacherId,
        sectionId,
        contentId: content.id,
      },
    });

    return tx.classContent.findUniqueOrThrow({
      where: { id: content.id },
      include: assessmentInclude,
    });
  });

  return result;
}

export async function getAssessments(teacherId: string, sectionId?: string) {
  const where: Prisma.ClassContentWhereInput = { type: "ASSESSMENT" };
  if (sectionId) {
    await assertTeacherOwnsSection(teacherId, sectionId);
    where.sectionId = sectionId;
  }

  return prisma.classContent.findMany({
    where,
    include: assessmentInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAssessmentDetail(teacherId: string, assessmentId: string) {
  const assessment = await prisma.classContent.findUnique({
    where: { id: assessmentId },
    include: { ...assessmentInclude, attempts: { include: { student: { select: { id: true, name: true, email: true } } }, orderBy: { startedAt: "desc" } } },
  });

  if (!assessment) throw new AppError("Assessment was not found.", 404, "ASSESSMENT_NOT_FOUND");
  if (assessment.type !== "ASSESSMENT") throw new AppError("Not an assessment.", 400, "INVALID_TYPE");
  if (assessment.teacherId !== teacherId) throw new AppError("You cannot view another teacher's assessment.", 403, "ASSESSMENT_FORBIDDEN");

  return assessment;
}

export async function updateAssessment(
  teacherId: string,
  assessmentId: string,
  input: {
    title?: string;
    description?: string | null;
    instructions?: string | null;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    totalPoints?: number | null;
    timeLimitMinutes?: number | null;
    passingScore?: number | null;
    attemptsAllowed?: number;
    autoGrade?: boolean;
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
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
    where: { id: assessmentId },
    select: { id: true, teacherId: true, type: true },
  });

  if (!existing) throw new AppError("Assessment was not found.", 404, "ASSESSMENT_NOT_FOUND");
  if (existing.type !== "ASSESSMENT") throw new AppError("Not an assessment.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's assessment.", 403, "ASSESSMENT_FORBIDDEN");

  if (input.questions) {
    await prisma.contentQuestion.deleteMany({ where: { contentId: assessmentId } });
    if (input.questions.length > 0) {
      await prisma.contentQuestion.createMany({
        data: input.questions.map((q) => ({
          contentId: assessmentId,
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
  if (input.timeLimitMinutes !== undefined) data.timeLimitMinutes = input.timeLimitMinutes;
  if (input.passingScore !== undefined) data.passingScore = input.passingScore;
  if (input.attemptsAllowed !== undefined) data.attemptsAllowed = input.attemptsAllowed;
  if (input.autoGrade !== undefined) data.autoGrade = input.autoGrade;
  if (input.shuffleQuestions !== undefined) data.shuffleQuestions = input.shuffleQuestions;
  if (input.shuffleChoices !== undefined) data.shuffleChoices = input.shuffleChoices;
  if (input.isPublished !== undefined) data.isPublished = input.isPublished;

  return prisma.classContent.update({
    where: { id: assessmentId },
    data,
    include: assessmentInclude,
  });
}

export async function deleteAssessment(teacherId: string, assessmentId: string) {
  const existing = await prisma.classContent.findUnique({
    where: { id: assessmentId },
    select: { id: true, teacherId: true, type: true },
  });

  if (!existing) throw new AppError("Assessment was not found.", 404, "ASSESSMENT_NOT_FOUND");
  if (existing.type !== "ASSESSMENT") throw new AppError("Not an assessment.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot delete another teacher's assessment.", 403, "ASSESSMENT_FORBIDDEN");

  await prisma.classContent.delete({ where: { id: assessmentId } });
}

export async function togglePublishAssessment(teacherId: string, assessmentId: string) {
  const existing = await prisma.classContent.findUnique({
    where: { id: assessmentId },
    select: { id: true, teacherId: true, type: true, isPublished: true },
  });

  if (!existing) throw new AppError("Assessment was not found.", 404, "ASSESSMENT_NOT_FOUND");
  if (existing.type !== "ASSESSMENT") throw new AppError("Not an assessment.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's assessment.", 403, "ASSESSMENT_FORBIDDEN");

  return prisma.classContent.update({
    where: { id: assessmentId },
    data: { isPublished: !existing.isPublished },
    include: assessmentInclude,
  });
}
