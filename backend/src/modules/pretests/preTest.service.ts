import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsSection } from "../teacher/teacher.ownership";
import type { Prisma } from "@prisma/client";

const preTestInclude = {
  questions: true,
  _count: { select: { questions: true, attempts: true } },
};

export async function createPreTest(
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
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
    attemptsAllowed?: number;
    showScoreImmediately?: boolean;
    randomQuestions?: number | null;
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
      matchingPairs?: Array<{ left: string; right: string }> | null;
      enumerationItems?: string[];
    }>;
  },
) {
  const sectionId = input.sectionId ?? input.classId;
  if (!sectionId) throw new AppError("sectionId or classId is required.", 400, "SECTION_REQUIRED");
  await assertTeacherOwnsSection(teacherId, sectionId);

  const content = await prisma.classContent.create({
    data: {
      title: input.title,
      type: "PRETEST",
      description: input.description ?? null,
      instructions: input.instructions ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
      availableTo: input.availableTo ? new Date(input.availableTo) : null,
      maxScore: input.totalPoints ?? null,
      timeLimitMinutes: input.timeLimitMinutes ?? null,
      passingScore: input.passingScore ?? null,
      shuffleQuestions: input.shuffleQuestions ?? false,
      shuffleChoices: input.shuffleChoices ?? false,
      attemptsAllowed: input.attemptsAllowed ?? 1,
      showScoreImmediately: input.showScoreImmediately ?? true,
      randomQuestions: input.randomQuestions ?? null,
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
          matchingPairs: q.matchingPairs ? JSON.parse(JSON.stringify(q.matchingPairs)) : null,
          enumerationItems: q.enumerationItems ?? [],
        })),
      } : undefined,
    },
    include: preTestInclude,
  });

  return content;
}

export async function getPreTests(teacherId: string, sectionId?: string) {
  const where: Prisma.ClassContentWhereInput = { type: "PRETEST" };
  if (sectionId) {
    await assertTeacherOwnsSection(teacherId, sectionId);
    where.sectionId = sectionId;
  }

  return prisma.classContent.findMany({
    where,
    include: preTestInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPreTestDetail(teacherId: string, preTestId: string) {
  const preTest = await prisma.classContent.findUnique({
    where: { id: preTestId },
    include: { ...preTestInclude, attempts: { include: { student: { select: { id: true, name: true, email: true } } }, orderBy: { startedAt: "desc" } } },
  });

  if (!preTest) throw new AppError("Pre-Test was not found.", 404, "PRETEST_NOT_FOUND");
  if (preTest.type !== "PRETEST") throw new AppError("Not a pre-test.", 400, "INVALID_TYPE");
  if (preTest.teacherId !== teacherId) throw new AppError("You cannot view another teacher's pre-test.", 403, "PRETEST_FORBIDDEN");

  return preTest;
}

export async function updatePreTest(
  teacherId: string,
  preTestId: string,
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
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
    attemptsAllowed?: number;
    showScoreImmediately?: boolean;
    randomQuestions?: number | null;
    isPublished?: boolean;
    questions?: Array<{
      equation: string;
      questionType?: string;
      choices: string[];
      correctAnswer: string;
      explanation: string;
      points?: number;
      difficulty?: string;
      matchingPairs?: Array<{ left: string; right: string }> | null;
      enumerationItems?: string[];
    }>;
  },
) {
  const existing = await prisma.classContent.findUnique({
    where: { id: preTestId },
    select: { id: true, teacherId: true, type: true },
  });

  if (!existing) throw new AppError("Pre-Test was not found.", 404, "PRETEST_NOT_FOUND");
  if (existing.type !== "PRETEST") throw new AppError("Not a pre-test.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's pre-test.", 403, "PRETEST_FORBIDDEN");

  if (input.questions) {
    await prisma.contentQuestion.deleteMany({ where: { contentId: preTestId } });
    if (input.questions.length > 0) {
      await prisma.contentQuestion.createMany({
        data: input.questions.map((q) => ({
          contentId: preTestId,
          equation: q.equation,
          questionType: (q.questionType as any) ?? "MULTIPLE_CHOICE",
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points ?? 1,
          difficulty: q.difficulty ?? "Medium",
          matchingPairs: q.matchingPairs ? JSON.parse(JSON.stringify(q.matchingPairs)) : null,
          enumerationItems: q.enumerationItems ?? [],
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
  if (input.shuffleQuestions !== undefined) data.shuffleQuestions = input.shuffleQuestions;
  if (input.shuffleChoices !== undefined) data.shuffleChoices = input.shuffleChoices;
  if (input.attemptsAllowed !== undefined) data.attemptsAllowed = input.attemptsAllowed;
  if (input.showScoreImmediately !== undefined) data.showScoreImmediately = input.showScoreImmediately;
  if (input.randomQuestions !== undefined) data.randomQuestions = input.randomQuestions;
  if (input.isPublished !== undefined) data.isPublished = input.isPublished;

  return prisma.classContent.update({
    where: { id: preTestId },
    data,
    include: preTestInclude,
  });
}

export async function deletePreTest(teacherId: string, preTestId: string) {
  const existing = await prisma.classContent.findUnique({
    where: { id: preTestId },
    select: { id: true, teacherId: true, type: true },
  });

  if (!existing) throw new AppError("Pre-Test was not found.", 404, "PRETEST_NOT_FOUND");
  if (existing.type !== "PRETEST") throw new AppError("Not a pre-test.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot delete another teacher's pre-test.", 403, "PRETEST_FORBIDDEN");

  await prisma.classContent.delete({ where: { id: preTestId } });
}

export async function togglePublishPreTest(teacherId: string, preTestId: string) {
  const existing = await prisma.classContent.findUnique({
    where: { id: preTestId },
    select: { id: true, teacherId: true, type: true, isPublished: true },
  });

  if (!existing) throw new AppError("Pre-Test was not found.", 404, "PRETEST_NOT_FOUND");
  if (existing.type !== "PRETEST") throw new AppError("Not a pre-test.", 400, "INVALID_TYPE");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's pre-test.", 403, "PRETEST_FORBIDDEN");

  return prisma.classContent.update({
    where: { id: preTestId },
    data: { isPublished: !existing.isPublished },
    include: preTestInclude,
  });
}
