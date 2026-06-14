import { UserRole } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { calculateLeaderboardScore } from "../../utils/calculateLeaderboardScore";
import {
  assertTeacherCanViewStudent,
  assertTeacherOwnsGuide,
  assertTeacherOwnsQuestion,
  assertTeacherOwnsQuest,
  assertTeacherOwnsSection,
} from "./teacher.ownership";

function publishedQuestWhere() {
  return { isPublished: true };
}

type SectionInput = { name: string; description?: string | null; code?: string };
type StudentLookupInput = { studentId?: string; email?: string };
type LinkInput = { classId?: string | null; sectionId?: string | null; questId?: string | null; guideId?: string | null };
type GuideInput = LinkInput & {
  title: string;
  topic: string;
  shortExplanation: string;
  exampleProblem: string;
  solutionSteps: string[];
  tips: string[];
};
type QuestionInput = {
  equation: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  solutionSteps: string[];
  difficulty?: string;
};
type QuestInput = LinkInput & {
  title: string;
  worldName: string;
  topic: string;
  difficulty: string;
  requiredPuzzlePieces: number;
  maxHearts?: number;
  hintLimit?: number;
  xpReward?: number;
  coinReward?: number;
  levelNumber: number;
  isPublished?: boolean;
  questions?: QuestionInput[];
};
const studentSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  xp: true,
  coins: true,
};

function round2(value: number) {
  return Number(value.toFixed(2));
}

function calculateAccuracy(correctAnswers: number, wrongAnswers: number) {
  const totalAnswers = correctAnswers + wrongAnswers;
  return totalAnswers === 0 ? 0 : round2((correctAnswers / totalAnswers) * 100);
}

function resolveSectionId(input: LinkInput) {
  if (input.classId !== undefined && input.sectionId !== undefined && input.classId !== input.sectionId) {
    throw new AppError("classId and sectionId must refer to the same section.", 400, "SECTION_ID_CONFLICT");
  }

  return input.sectionId !== undefined ? input.sectionId : input.classId;
}

function requireSectionId(input: LinkInput) {
  const sectionId = resolveSectionId(input);
  if (!sectionId) {
    throw new AppError("sectionId is required.", 400, "SECTION_REQUIRED");
  }

  return sectionId;
}

function toCoinsEarned(
  progress: { coinsEarned?: number; questCompleted: boolean } | null | undefined,
  coinReward: number,
) {
  if (!progress) return 0;
  return progress.coinsEarned ?? (progress.questCompleted ? coinReward : 0);
}

function shapeSection<T extends { studentSections?: Array<{ joinedAt: Date; status?: string; grade?: number | null; student: unknown }> }>(section: T) {
  const { studentSections = [], ...rest } = section;
  return {
    ...rest,
    students: studentSections.map((enrollment) => ({
      ...(enrollment.student as object),
      joinedAt: enrollment.joinedAt,
      status: enrollment.status,
      grade: enrollment.grade ?? null,
    })),
  };
}

function generateSectionCodeCandidate() {
  return randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

async function generateUniqueSectionCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateSectionCodeCandidate();
    const existing = await prisma.classSection.findUnique({ where: { code }, select: { id: true } });
    if (!existing) return code;
  }

  throw new AppError("Unable to generate a unique section code. Please try again.", 500, "SECTION_CODE_GENERATION_FAILED");
}

async function ensureUniqueSectionCode(code: string, ignoreSectionId?: string) {
  const duplicate = await prisma.classSection.findFirst({
    where: { code, ...(ignoreSectionId ? { NOT: { id: ignoreSectionId } } : {}) },
    select: { id: true },
  });

  if (duplicate) {
    throw new AppError("A section with this code already exists.", 409, "SECTION_CODE_DUPLICATE");
  }
}

function summarizeProgress(
  progress: Array<{
    questCompleted: boolean;
    correctAnswers: number;
    wrongAnswers: number;
    timeSpent: number;
    xp: number;
    coinsEarned: number;
  }>,
  totalQuests: number,
) {
  const completedQuests = progress.filter((record) => record.questCompleted).length;
  const correctAnswers = progress.reduce((sum, record) => sum + record.correctAnswers, 0);
  const wrongAnswers = progress.reduce((sum, record) => sum + record.wrongAnswers, 0);

  return {
    totalQuests,
    completedQuests,
    completionProgress: totalQuests === 0 ? 0 : round2((completedQuests / totalQuests) * 100),
    accuracy: calculateAccuracy(correctAnswers, wrongAnswers),
    timeSpent: progress.reduce((sum, record) => sum + record.timeSpent, 0),
    xpEarned: progress.reduce((sum, record) => sum + record.xp, 0),
    coinsEarned: progress.reduce((sum, record) => sum + record.coinsEarned, 0),
  };
}

async function ensureUniqueSectionName(teacherId: string, name: string, ignoreSectionId?: string) {
  const duplicate = await prisma.classSection.findFirst({
    where: {
      teacherId,
      name: { equals: name, mode: "insensitive" },
      ...(ignoreSectionId ? { NOT: { id: ignoreSectionId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new AppError("A section with this name already exists.", 409, "SECTION_NAME_DUPLICATE");
  }
}

async function validateQuestLink(teacherId: string, questId: string | null | undefined, sectionId: string) {
  if (!questId) return;

  const quest = await assertTeacherOwnsQuest(teacherId, questId);
  if (quest.sectionId !== sectionId) {
    throw new AppError("Featured quest must belong to the same section.", 400, "INVALID_GUIDE_QUEST_SECTION");
  }
}

async function validateGuideLink(teacherId: string, guideId: string | null | undefined, sectionId: string) {
  if (!guideId) return;

  const guide = await assertTeacherOwnsGuide(teacherId, guideId);
  if (guide.sectionId !== sectionId) {
    throw new AppError("Quest guide must belong to the same section.", 400, "INVALID_QUEST_GUIDE_SECTION");
  }
}

async function loadSectionLeaderboardData(teacherId: string, sectionId: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      name: true,
      studentSections: {
        where: { status: "ACTIVE" },
        select: { joinedAt: true, grade: true, student: { select: studentSelect } },
        orderBy: { student: { name: "asc" } },
      },
      quests: {
        where: publishedQuestWhere(),
        select: { id: true, title: true, topic: true, levelNumber: true, requiredPuzzlePieces: true, coinReward: true },
        orderBy: [{ levelNumber: "asc" }, { title: "asc" }],
      },
    },
  });

  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }

  const students = section.studentSections.map((enrollment) => enrollment.student);
  const progress = await prisma.studentProgress.findMany({
    where: {
      sectionId,
      studentId: { in: students.map((student) => student.id) },
      questId: { in: section.quests.map((quest) => quest.id) },
    },
  });

  return { section, students, quests: section.quests, progress };
}

function buildLeaderboardRows(
  students: Array<{ id: string; name: string; email: string; avatarUrl: string | null; xp?: number; coins?: number }>,
  quests: Array<{ id: string; requiredPuzzlePieces: number; coinReward: number }>,
  progressRecords: Array<{
    studentId: string;
    questId: string;
    score: number;
    xp: number;
    questCompleted: boolean;
    correctAnswers: number;
    wrongAnswers: number;
    timeSpent: number;
    coinsEarned: number;
  }>,
) {
  const totalQuests = quests.length;
  const maxScore = quests.reduce((sum, quest) => sum + quest.requiredPuzzlePieces * 10, 0);
  const questMap = new Map(quests.map((quest) => [quest.id, quest]));

  return students
    .map((student) => {
      const progress = progressRecords.filter((record) => record.studentId === student.id);
      const totalScore = progress.reduce((sum, item) => sum + item.score, 0);
      const completedQuests = progress.filter((item) => item.questCompleted).length;
      const totalCorrect = progress.reduce((sum, item) => sum + item.correctAnswers, 0);
      const totalWrong = progress.reduce((sum, item) => sum + item.wrongAnswers, 0);
      const accuracy = calculateAccuracy(totalCorrect, totalWrong);
      const totalTimeSpent = progress.reduce((sum, item) => sum + item.timeSpent, 0);
      const overallScore = calculateLeaderboardScore({
        score: Math.min(totalScore, maxScore),
        maxScore,
        completedQuests,
        totalQuests,
        accuracy,
      });

      return {
        student,
        totalScore,
        completedQuests,
        totalQuests,
        completionProgress: totalQuests === 0 ? 0 : round2((completedQuests / totalQuests) * 100),
        accuracy,
        totalTimeSpent,
        xpEarned: progress.reduce((sum, item) => sum + item.xp, 0),
        coinsEarned: progress.reduce((sum, item) => {
          const quest = questMap.get(item.questId);
          return sum + (quest ? toCoinsEarned(item, quest.coinReward) : 0);
        }, 0),
        overallScore,
      };
    })
    .sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.completedQuests !== a.completedQuests) return b.completedQuests - a.completedQuests;
      if (a.totalTimeSpent !== b.totalTimeSpent) return a.totalTimeSpent - b.totalTimeSpent;
      return a.student.name.localeCompare(b.student.name);
    })
    .map((row, index) => ({ rank: index + 1, ...row }));
}

export async function createSection(teacherId: string, input: SectionInput) {
  await ensureUniqueSectionName(teacherId, input.name);
  const code = input.code ?? (await generateUniqueSectionCode());
  await ensureUniqueSectionCode(code);

  const section = await prisma.classSection.create({
    data: { name: input.name, description: input.description ?? null, code, teacherId },
    include: {
      studentSections: { include: { student: { select: studentSelect } } },
      _count: { select: { studentSections: true, questGuides: true, quests: true } },
    },
  });

  return shapeSection(section);
}

export async function getSections(teacherId: string) {
  return prisma.classSection.findMany({
    where: { teacherId },
    include: { _count: { select: { studentSections: true, questGuides: true, quests: true } } },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
}

export async function getSection(teacherId: string, sectionId: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      studentSections: {
        where: { status: "ACTIVE" },
        include: { student: { select: studentSelect } },
        orderBy: { student: { name: "asc" } },
      },
      questGuides: {
        include: {
          featuredQuest: { select: { id: true, title: true, levelNumber: true } },
          _count: { select: { quests: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      quests: {
        where: publishedQuestWhere(),
        include: {
          guide: { select: { id: true, title: true } },
          _count: { select: { questions: true, progress: true } },
        },
        orderBy: [{ levelNumber: "asc" }, { updatedAt: "desc" }],
      },
    },
  });

  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }

  return { ...shapeSection(section), topStudent: await getTopStudent(teacherId, sectionId) };
}

export async function updateSection(teacherId: string, sectionId: string, input: Partial<SectionInput>) {
  await assertTeacherOwnsSection(teacherId, sectionId);
  if (input.name) await ensureUniqueSectionName(teacherId, input.name, sectionId);
  if (input.code) await ensureUniqueSectionCode(input.code, sectionId);

  const section = await prisma.classSection.update({
    where: { id: sectionId },
    data: input,
    include: {
      studentSections: { where: { status: "ACTIVE" }, include: { student: { select: studentSelect } } },
      _count: { select: { studentSections: true, questGuides: true, quests: true } },
    },
  });

  return shapeSection(section);
}

export async function deleteSection(teacherId: string, sectionId: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const dependencies = await prisma.classSection.findUnique({
    where: { id: sectionId },
    select: {
      _count: { select: { studentSections: true, questGuides: true, quests: true, progressRecords: true } },
    },
  });

  const count = dependencies?._count;
  if (count && (count.studentSections > 0 || count.questGuides > 0 || count.quests > 0 || count.progressRecords > 0)) {
    throw new AppError("Section cannot be deleted while it has students, quests, guides, or progress.", 409, "SECTION_HAS_DEPENDENCIES");
  }

  await prisma.classSection.delete({ where: { id: sectionId } });
}

export async function searchStudents(teacherId: string, input: { q: string; limit: number }) {
  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      OR: [
        { name: { contains: input.q, mode: "insensitive" } },
        { email: { contains: input.q, mode: "insensitive" } },
      ],
    },
    select: {
      ...studentSelect,
      studentSections: {
        where: { status: "ACTIVE", section: { teacherId } },
        select: { joinedAt: true, section: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    take: input.limit,
  });

  return students.map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    avatarUrl: student.avatarUrl,
    xp: student.xp,
    coins: student.coins,
    enrolledSections: student.studentSections.map((enrollment) => ({
      ...enrollment.section,
      joinedAt: enrollment.joinedAt,
    })),
  }));
}

export async function addStudentToSection(teacherId: string, sectionId: string, input: StudentLookupInput) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const student = await prisma.user.findFirst({
    where: {
      role: UserRole.STUDENT,
      ...(input.studentId && input.email
        ? { id: input.studentId, email: input.email }
        : input.studentId
          ? { id: input.studentId }
          : { email: input.email }),
    },
    select: { id: true },
  });

  if (!student) {
    throw new AppError("Student was not found.", 404, "STUDENT_NOT_FOUND");
  }

  const duplicate = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId: student.id, sectionId } },
    select: { id: true, status: true },
  });

  if (duplicate?.status === "ACTIVE") {
    throw new AppError("Student is already enrolled in this section.", 409, "DUPLICATE_ENROLLMENT");
  }

  if (duplicate) {
    await prisma.enrollment.update({
      where: { studentId_sectionId: { studentId: student.id, sectionId } },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
  } else {
    await prisma.enrollment.create({ data: { studentId: student.id, sectionId } });
  }

  return getStudentsInSection(teacherId, sectionId);
}

export async function removeStudentFromSection(teacherId: string, sectionId: string, studentId: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status === "REMOVED") {
    throw new AppError("Student is not enrolled in this section.", 404, "ENROLLMENT_NOT_FOUND");
  }

  await prisma.enrollment.update({
    where: { studentId_sectionId: { studentId, sectionId } },
    data: { status: "REMOVED" },
  });
  return getStudentsInSection(teacherId, sectionId);
}

export async function getStudentsInSection(teacherId: string, sectionId: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      name: true,
      code: true,
      studentSections: {
        where: { status: "ACTIVE" },
        select: { joinedAt: true, status: true, grade: true, student: { select: studentSelect } },
        orderBy: { student: { name: "asc" } },
      },
      quests: { select: { id: true } },
    },
  });

  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }

  const progress = await prisma.studentProgress.findMany({
    where: {
      sectionId,
      studentId: { in: section.studentSections.map((enrollment) => enrollment.student.id) },
    },
  });
  const progressByStudent = new Map<string, typeof progress>();

  for (const record of progress) {
    const rows = progressByStudent.get(record.studentId) ?? [];
    rows.push(record);
    progressByStudent.set(record.studentId, rows);
  }

  return {
    id: section.id,
    name: section.name,
    code: section.code,
    students: section.studentSections.map((enrollment) => ({
      ...enrollment.student,
      joinedAt: enrollment.joinedAt,
      status: enrollment.status,
      grade: enrollment.grade,
      progressSummary: summarizeProgress(progressByStudent.get(enrollment.student.id) ?? [], section.quests.length),
    })),
  };
}

export async function updateStudentGrade(
  teacherId: string,
  sectionId: string,
  studentId: string,
  grade: number | null,
) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status === "REMOVED") {
    throw new AppError("Student is not enrolled in this section.", 404, "ENROLLMENT_NOT_FOUND");
  }

  return prisma.enrollment.update({
    where: { studentId_sectionId: { studentId, sectionId } },
    data: { grade },
    select: { id: true, studentId: true, sectionId: true, grade: true },
  });
}

export async function regenerateSectionCode(teacherId: string, sectionId: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);
  const code = await generateUniqueSectionCode();

  return prisma.classSection.update({
    where: { id: sectionId },
    data: { code },
    select: { id: true, name: true, code: true, updatedAt: true },
  });
}

export async function createGuide(teacherId: string, input: GuideInput) {
  const sectionId = requireSectionId(input);
  await assertTeacherOwnsSection(teacherId, sectionId);
  await validateQuestLink(teacherId, input.questId, sectionId);
  const { sectionId: _sectionId, classId: _classId, ...data } = input;

  return prisma.questGuide.create({
    data: { ...data, sectionId, teacherId },
    include: {
      section: true,
      featuredQuest: { select: { id: true, title: true, levelNumber: true } },
      quests: { select: { id: true, title: true, levelNumber: true } },
    },
  });
}

export async function getGuides(teacherId: string, query: { sectionId?: string }) {
  if (query.sectionId) await assertTeacherOwnsSection(teacherId, query.sectionId);

  return prisma.questGuide.findMany({
    where: { teacherId, ...(query.sectionId ? { sectionId: query.sectionId } : {}) },
    include: {
      section: true,
      featuredQuest: { select: { id: true, title: true, levelNumber: true } },
      quests: { select: { id: true, title: true, levelNumber: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
}

export async function getGuide(teacherId: string, guideId: string) {
  await assertTeacherOwnsGuide(teacherId, guideId);

  return prisma.questGuide.findUnique({
    where: { id: guideId },
    include: {
      section: true,
      featuredQuest: { select: { id: true, title: true, levelNumber: true, sectionId: true } },
      quests: {
        include: {
          section: { select: { id: true, name: true } },
          _count: { select: { questions: true, progress: true } },
        },
        orderBy: [{ levelNumber: "asc" }, { title: "asc" }],
      },
    },
  });
}

export async function updateGuide(teacherId: string, guideId: string, input: Partial<GuideInput>) {
  const guide = await assertTeacherOwnsGuide(teacherId, guideId);
  const requestedSectionId = resolveSectionId(input);
  const sectionId = requestedSectionId ?? guide.sectionId;
  if (requestedSectionId) await assertTeacherOwnsSection(teacherId, requestedSectionId);
  await validateQuestLink(teacherId, input.questId ?? guide.questId, sectionId);
  const { sectionId: _sectionId, classId: _classId, guideId: _guideId, ...data } = input;

  return prisma.questGuide.update({
    where: { id: guideId },
    data: { ...data, ...(requestedSectionId ? { sectionId: requestedSectionId } : {}) },
    include: {
      section: true,
      featuredQuest: { select: { id: true, title: true, levelNumber: true } },
      quests: { select: { id: true, title: true, levelNumber: true } },
    },
  });
}

export async function deleteGuide(teacherId: string, guideId: string) {
  await assertTeacherOwnsGuide(teacherId, guideId);

  await prisma.$transaction(async (tx) => {
    await tx.quest.updateMany({ where: { guideId, teacherId }, data: { guideId: null } });
    await tx.questGuide.delete({ where: { id: guideId } });
  });
}

export async function createQuest(teacherId: string, input: QuestInput) {
  const sectionId = resolveSectionId(input);
  if (!sectionId) {
    const sectionCount = await prisma.classSection.count({ where: { teacherId } });
    throw new AppError(
      sectionCount === 0 ? "You need to create a section first." : "Please select a section before creating a quest.",
      400,
      sectionCount === 0 ? "TEACHER_HAS_NO_SECTIONS" : "SECTION_REQUIRED",
    );
  }

  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    select: { id: true, teacherId: true },
  });
  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }
  if (section.teacherId !== teacherId) {
    throw new AppError("You are not allowed to create a quest for this section.", 403, "QUEST_SECTION_FORBIDDEN");
  }

  await validateGuideLink(teacherId, input.guideId, sectionId);
  const { questions = [], sectionId: _sectionId, classId: _classId, ...questData } = input;

  const maxQuest = await prisma.quest.findFirst({
    where: { sectionId },
    orderBy: { levelNumber: "desc" },
    select: { levelNumber: true },
  });
  const levelNumber = maxQuest ? maxQuest.levelNumber + 1 : 1;

  return prisma.quest.create({
    data: {
      ...questData,
      levelNumber,
      sectionId,
      teacherId,
      questions: {
        create: questions.map((question) => ({ ...question, difficulty: input.difficulty })),
      },
    },
    include: { section: true, guide: true, questions: true },
  });
}

export async function getQuests(teacherId: string, query: { sectionId?: string; guideId?: string }) {
  if (query.sectionId) await assertTeacherOwnsSection(teacherId, query.sectionId);
  if (query.guideId) await assertTeacherOwnsGuide(teacherId, query.guideId);

  return prisma.quest.findMany({
    where: {
      teacherId,
      ...(query.sectionId ? { sectionId: query.sectionId } : {}),
      ...(query.guideId ? { guideId: query.guideId } : {}),
    },
    include: {
      section: true,
      guide: true,
      questions: true,
      _count: { select: { progress: true, answerAttempts: true } },
    },
    orderBy: [{ levelNumber: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getQuest(teacherId: string, questId: string) {
  await assertTeacherOwnsQuest(teacherId, questId);

  return prisma.quest.findUnique({
    where: { id: questId },
    include: {
      section: true,
      guide: true,
      guideReferences: { select: { id: true, title: true } },
      questions: { orderBy: { createdAt: "asc" } },
      _count: { select: { progress: true, answerAttempts: true } },
    },
  });
}

export async function updateQuest(teacherId: string, questId: string, input: Partial<QuestInput>) {
  const quest = await assertTeacherOwnsQuest(teacherId, questId);
  const requestedSectionId = resolveSectionId(input);
  const sectionId = requestedSectionId ?? quest.sectionId;
  if (requestedSectionId) await assertTeacherOwnsSection(teacherId, requestedSectionId);
  await validateGuideLink(teacherId, input.guideId ?? quest.guideId, sectionId);
  const { questions, sectionId: _sectionId, classId: _classId, questId: _questId, ...questData } = input;

  return prisma.$transaction(async (tx) => {
    const progressCount = await tx.studentProgress.count({ where: { questId } });
    if (requestedSectionId && requestedSectionId !== quest.sectionId && progressCount > 0) {
      throw new AppError("Quest section cannot be changed after student progress exists.", 409, "QUEST_HAS_PROGRESS");
    }

    if (questions) {
      const attempts = await tx.answerAttempt.count({ where: { questId } });
      if (attempts > 0) {
        throw new AppError("Questions cannot be replaced after students have submitted answers.", 409, "QUEST_HAS_ATTEMPTS");
      }
      await tx.questQuestion.deleteMany({ where: { questId } });
    }

    return tx.quest.update({
      where: { id: questId },
      data: {
        ...questData,
        ...(requestedSectionId ? { sectionId: requestedSectionId } : {}),
        ...(questions
          ? {
              questions: {
                create: questions.map((question) => ({
                  ...question,
                  difficulty: questData.difficulty ?? quest.difficulty,
                })),
              },
            }
          : {}),
      },
      include: { section: true, guide: true, questions: true },
    });
  });
}

export async function deleteQuest(teacherId: string, questId: string) {
  await assertTeacherOwnsQuest(teacherId, questId);
  const [progressCount, attemptCount] = await Promise.all([
    prisma.studentProgress.count({ where: { questId } }),
    prisma.answerAttempt.count({ where: { questId } }),
  ]);

  if (progressCount > 0 || attemptCount > 0) {
    throw new AppError("Quest cannot be deleted after student progress exists.", 409, "QUEST_HAS_PROGRESS");
  }

  await prisma.$transaction(async (tx) => {
    const quest = await tx.quest.findUnique({
      where: { id: questId },
      select: { sectionId: true },
    });

    await tx.questGuide.updateMany({ where: { questId, teacherId }, data: { questId: null } });
    await tx.quest.delete({ where: { id: questId } });

    if (quest) {
      const remainingQuests = await tx.quest.findMany({
        where: { sectionId: quest.sectionId },
        orderBy: { levelNumber: "asc" },
        select: { id: true, levelNumber: true },
      });

      for (let i = 0; i < remainingQuests.length; i++) {
        const nextLevel = i + 1;
        if (remainingQuests[i].levelNumber !== nextLevel) {
          await tx.quest.update({
            where: { id: remainingQuests[i].id },
            data: { levelNumber: nextLevel },
          });
        }
      }
    }
  });
}

export async function addQuestionsToQuest(teacherId: string, questId: string, questions: QuestionInput[]) {
  const quest = await assertTeacherOwnsQuest(teacherId, questId);

  return prisma.questQuestion.createManyAndReturn({
    data: questions.map((question) => ({ ...question, questId, difficulty: quest.difficulty })),
  });
}

export async function updateQuestion(teacherId: string, questionId: string, input: Partial<QuestionInput>) {
  const question = await assertTeacherOwnsQuestion(teacherId, questionId);
  const choices = input.choices ?? question.choices;
  const correctAnswer = input.correctAnswer ?? question.correctAnswer;

  if (!choices.map((choice) => choice.trim().toLowerCase()).includes(correctAnswer.trim().toLowerCase())) {
    throw new AppError("correctAnswer must match one of the choices.", 400, "INVALID_CORRECT_ANSWER");
  }

  return prisma.questQuestion.update({ where: { id: questionId }, data: input });
}

export async function deleteQuestion(teacherId: string, questionId: string) {
  const question = await assertTeacherOwnsQuestion(teacherId, questionId);
  const answerAttempts = await prisma.answerAttempt.count({ where: { questionId } });
  if (answerAttempts > 0) {
    throw new AppError("Question cannot be deleted after students have answered it.", 409, "QUESTION_HAS_ATTEMPTS");
  }

  await prisma.questQuestion.delete({ where: { id: question.id } });
}

export async function getSectionLeaderboard(teacherId: string, sectionId: string, input: { limit?: number } = {}) {
  const { section, students, quests, progress } = await loadSectionLeaderboardData(teacherId, sectionId);
  const leaderboard = buildLeaderboardRows(students, quests, progress);

  return {
    section: { id: section.id, name: section.name },
    formula: {
      questScoreWeight: 40,
      completionProgressWeight: 40,
      accuracyWeight: 20,
      tieBreakers: ["Higher accuracy", "More completed quests", "Lower time spent"],
    },
    leaderboard: input.limit ? leaderboard.slice(0, input.limit) : leaderboard,
    top5: leaderboard.slice(0, 5),
  };
}

export async function getTopStudent(teacherId: string, sectionId: string) {
  const data = await getSectionLeaderboard(teacherId, sectionId, { limit: 1 });
  return data.leaderboard[0] ?? null;
}

export async function getSectionProgress(teacherId: string, sectionId: string) {
  const { section, students, quests, progress } = await loadSectionLeaderboardData(teacherId, sectionId);
  const progressByStudentQuest = new Map(progress.map((record) => [`${record.studentId}:${record.questId}`, record]));

  let completedQuestSlots = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalTimeSpent = 0;
  let totalXpEarned = 0;
  let totalCoinsEarned = 0;

  const rows = students.map((student) => {
    let completedQuests = 0;
    let studentCorrect = 0;
    let studentWrong = 0;
    let studentTimeSpent = 0;
    let studentXpEarned = 0;
    let studentCoinsEarned = 0;

    const questRows = quests.map((quest) => {
      const item = progressByStudentQuest.get(`${student.id}:${quest.id}`) ?? null;
      if (item?.questCompleted) {
        completedQuestSlots += 1;
        completedQuests += 1;
      }

      studentCorrect += item?.correctAnswers ?? 0;
      studentWrong += item?.wrongAnswers ?? 0;
      studentTimeSpent += item?.timeSpent ?? 0;
      studentXpEarned += item?.xp ?? 0;
      studentCoinsEarned += toCoinsEarned(item, quest.coinReward);

      return {
        quest,
        progress: item
          ? {
              id: item.id,
              guideViewed: item.guideViewed,
              questUnlocked: item.questUnlocked,
              questCompleted: item.questCompleted,
              score: item.score,
              xpEarned: item.xp,
              coinsEarned: toCoinsEarned(item, quest.coinReward),
              puzzlePieces: item.puzzlePieces,
              heartsRemaining: item.heartsRemaining,
              hintsUsed: item.hintsUsed,
              correctAnswers: item.correctAnswers,
              wrongAnswers: item.wrongAnswers,
              accuracy: item.accuracy,
              timeSpent: item.timeSpent,
              startedAt: item.startedAt,
              completedAt: item.completedAt,
              updatedAt: item.updatedAt,
            }
          : null,
      };
    });

    totalCorrect += studentCorrect;
    totalWrong += studentWrong;
    totalTimeSpent += studentTimeSpent;
    totalXpEarned += studentXpEarned;
    totalCoinsEarned += studentCoinsEarned;

    return {
      student,
      completedQuests,
      totalQuests: quests.length,
      completionProgress: quests.length === 0 ? 0 : round2((completedQuests / quests.length) * 100),
      accuracy: calculateAccuracy(studentCorrect, studentWrong),
      timeSpent: studentTimeSpent,
      xpEarned: studentXpEarned,
      coinsEarned: studentCoinsEarned,
      quests: questRows,
    };
  });

  const totalQuestSlots = students.length * quests.length;

  return {
    section: { id: section.id, name: section.name },
    summary: {
      totalStudents: students.length,
      totalQuests: quests.length,
      totalQuestSlots,
      completedQuestSlots,
      questCompletionRate: totalQuestSlots === 0 ? 0 : round2((completedQuestSlots / totalQuestSlots) * 100),
      accuracy: calculateAccuracy(totalCorrect, totalWrong),
      timeSpent: totalTimeSpent,
      xpEarned: totalXpEarned,
      coinsEarned: totalCoinsEarned,
    },
    students: rows,
  };
}

export async function getStudentProgress(teacherId: string, studentId: string) {
  const student = await assertTeacherCanViewStudent(teacherId, studentId);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "ACTIVE", section: { teacherId } },
    select: {
      section: {
        select: {
          id: true,
          name: true,
          quests: {
            where: publishedQuestWhere(),
            select: { id: true, title: true, topic: true, levelNumber: true, requiredPuzzlePieces: true, coinReward: true },
            orderBy: [{ levelNumber: "asc" }, { title: "asc" }],
          },
        },
      },
    },
    orderBy: { section: { name: "asc" } },
  });

  const sectionIds = enrollments.map((enrollment) => enrollment.section.id);
  const progress = await prisma.studentProgress.findMany({
    where: { studentId, sectionId: { in: sectionIds } },
  });
  const progressBySectionQuest = new Map(progress.map((record) => [`${record.sectionId}:${record.questId}`, record]));

  let completedQuests = 0;
  let totalQuests = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalTimeSpent = 0;
  let totalXpEarned = 0;
  let totalCoinsEarned = 0;

  const sections = enrollments.map((enrollment) => ({
    section: { id: enrollment.section.id, name: enrollment.section.name },
    quests: enrollment.section.quests.map((quest) => {
      totalQuests += 1;
      const item = progressBySectionQuest.get(`${enrollment.section.id}:${quest.id}`) ?? null;
      if (item?.questCompleted) completedQuests += 1;
      totalCorrect += item?.correctAnswers ?? 0;
      totalWrong += item?.wrongAnswers ?? 0;
      totalTimeSpent += item?.timeSpent ?? 0;
      totalXpEarned += item?.xp ?? 0;
      totalCoinsEarned += toCoinsEarned(item, quest.coinReward);

      return { quest, progress: item };
    }),
  }));

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatarUrl,
      xp: student.xp,
      coins: student.coins,
    },
    summary: {
      totalSections: sections.length,
      totalQuests,
      completedQuests,
      completionProgress: totalQuests === 0 ? 0 : round2((completedQuests / totalQuests) * 100),
      accuracy: calculateAccuracy(totalCorrect, totalWrong),
      timeSpent: totalTimeSpent,
      xpEarned: totalXpEarned,
      coinsEarned: totalCoinsEarned,
    },
    sections,
  };
}

export async function getClassDetails(teacherId: string, classId: string) {
  await assertTeacherOwnsSection(teacherId, classId);

  const section = await prisma.classSection.findUnique({
    where: { id: classId },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      studentSections: {
        where: { status: "ACTIVE" },
        include: { student: { select: studentSelect } },
        orderBy: { student: { name: "asc" } },
      },
      questGuides: {
        include: {
          featuredQuest: { select: { id: true, title: true, levelNumber: true } },
          _count: { select: { quests: true } },
        },
        orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      },
      quests: {
        include: {
          guide: { select: { id: true, title: true } },
          _count: { select: { questions: true, progress: true } },
        },
        orderBy: [{ levelNumber: "asc" }, { title: "asc" }],
      },
    },
  });

  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }

  const students = section.studentSections.map((enrollment) => enrollment.student);
  const progress = await prisma.studentProgress.findMany({
    where: {
      sectionId: classId,
      studentId: { in: students.map((student) => student.id) },
      questId: { in: section.quests.map((quest) => quest.id) },
    },
    orderBy: { updatedAt: "desc" },
  });
  const progressByStudent = new Map<string, typeof progress>();

  for (const record of progress) {
    const rows = progressByStudent.get(record.studentId) ?? [];
    rows.push(record);
    progressByStudent.set(record.studentId, rows);
  }

  const leaderboard = buildLeaderboardRows(students, section.quests, progress).slice(0, 5);
  const studentRows = section.studentSections.map((enrollment) => {
    const studentProgress = progressByStudent.get(enrollment.student.id) ?? [];
    const summary = summarizeProgress(studentProgress, section.quests.length);
    const completedQuestIds = new Set(studentProgress.filter((record) => record.questCompleted).map((record) => record.questId));
    const currentQuest = section.quests.find((quest) => !completedQuestIds.has(quest.id)) ?? null;

    return {
      ...enrollment.student,
      joinedAt: enrollment.joinedAt,
      grade: enrollment.grade,
      progressSummary: summary,
      currentQuest: currentQuest ? { id: currentQuest.id, title: currentQuest.title, topic: currentQuest.topic } : null,
      status: summary.accuracy >= 90 ? "thriving" : summary.accuracy < 70 ? "at-risk" : "steady",
    };
  });

  const averageAccuracy =
    studentRows.length === 0 ? 0 : round2(studentRows.reduce((sum, student) => sum + student.progressSummary.accuracy, 0) / studentRows.length);
  const completionRate =
    studentRows.length === 0
      ? 0
      : round2(studentRows.reduce((sum, student) => sum + student.progressSummary.completionProgress, 0) / studentRows.length);

  return {
    classInfo: {
      id: section.id,
      name: section.name,
      code: section.code,
      teacher: section.teacher,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    },
    students: studentRows,
    analytics: {
      totalStudents: studentRows.length,
      averageAccuracy,
      completionRate,
      studentsAtRisk: studentRows.filter((student) => student.status === "at-risk").length,
      topStudent: leaderboard[0] ?? null,
    },
    assignedGuides: section.questGuides,
    assignedQuests: section.quests,
    leaderboard,
  };
}

export async function getDashboard(teacherId: string) {
  const sections = await prisma.classSection.findMany({
    where: { teacherId },
    select: {
      id: true,
      name: true,
      code: true,
      studentSections: { where: { status: "ACTIVE" }, select: { student: { select: studentSelect } } },
      quests: { where: publishedQuestWhere(), select: { id: true, title: true, requiredPuzzlePieces: true, coinReward: true } },
    },
    orderBy: { name: "asc" },
  });

  const studentMap = new Map<string, { id: string; name: string; email: string; avatarUrl: string | null; xp: number; coins: number }>();
  const questIds = sections.flatMap((section) => section.quests.map((quest) => quest.id));

  for (const section of sections) {
    for (const enrollment of section.studentSections) {
      studentMap.set(enrollment.student.id, enrollment.student);
    }
  }

  const progress = await prisma.studentProgress.findMany({
    where: { sectionId: { in: sections.map((section) => section.id) }, questId: { in: questIds } },
  });
  const totalCorrect = progress.reduce((sum, item) => sum + item.correctAnswers, 0);
  const totalWrong = progress.reduce((sum, item) => sum + item.wrongAnswers, 0);

  const topStudentPerSection = sections.map((section) => {
    const students = section.studentSections.map((enrollment) => enrollment.student);
    const sectionProgress = progress.filter((item) => item.sectionId === section.id);
    const rankings = buildLeaderboardRows(students, section.quests, sectionProgress);
    return { section: { id: section.id, name: section.name }, topStudent: rankings[0] ?? null };
  });

  const overallRows = sections.flatMap((section) =>
    buildLeaderboardRows(
      section.studentSections.map((enrollment) => enrollment.student),
      section.quests,
      progress.filter((item) => item.sectionId === section.id),
    ).map((row) => ({ ...row, section: { id: section.id, name: section.name } })),
  );
  const overallTopStudent =
    overallRows.sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.completedQuests !== a.completedQuests) return b.completedQuests - a.completedQuests;
      return a.totalTimeSpent - b.totalTimeSpent;
    })[0] ?? null;

  return {
    stats: {
      totalSections: sections.length,
      totalStudents: studentMap.size,
      totalActiveQuests: questIds.length,
      averageStudentAccuracy: calculateAccuracy(totalCorrect, totalWrong),
    },
    topStudentPerSection,
    overallTopStudent: overallTopStudent ? { ...overallTopStudent, rank: 1 } : null,
  };
}

export async function getAnalytics(teacherId: string, input: { sectionId?: string; range?: "7d" | "30d" | "term" } = {}) {
  if (input.sectionId) await assertTeacherOwnsSection(teacherId, input.sectionId);

  const since =
    input.range === "term"
      ? null
      : new Date(Date.now() - (input.range === "30d" ? 30 : 7) * 24 * 60 * 60 * 1000);

  const sections = await prisma.classSection.findMany({
    where: { teacherId, ...(input.sectionId ? { id: input.sectionId } : {}) },
    select: {
      id: true,
      name: true,
      studentSections: { where: { status: "ACTIVE" }, select: { studentId: true } },
      quests: {
        where: publishedQuestWhere(),
        select: { id: true, topic: true, requiredPuzzlePieces: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const sectionIds = sections.map((section) => section.id);
  const progress = await prisma.studentProgress.findMany({
    where: {
      sectionId: { in: sectionIds },
      ...(since ? { updatedAt: { gte: since } } : {}),
    },
    include: { quest: { select: { topic: true } } },
  });

  const points = sections.map((section) => {
    const questIds = new Set(section.quests.map((quest) => quest.id));
    const sectionProgress = progress.filter((record) => record.sectionId === section.id && questIds.has(record.questId));
    const totalQuestSlots = section.studentSections.length * section.quests.length;
    const completed = sectionProgress.filter((record) => record.questCompleted).length;
    const correct = sectionProgress.reduce((sum, record) => sum + record.correctAnswers, 0);
    const wrong = sectionProgress.reduce((sum, record) => sum + record.wrongAnswers, 0);

    return {
      label: section.name,
      completion: totalQuestSlots === 0 ? 0 : round2((completed / totalQuestSlots) * 100),
      accuracy: calculateAccuracy(correct, wrong),
      gameScore: sectionProgress.reduce((sum, record) => sum + record.score, 0),
    };
  });

  const topicMap = new Map<string, { correct: number; wrong: number; students: Set<string> }>();
  for (const record of progress) {
    const topic = record.quest.topic || "Untitled Topic";
    const current = topicMap.get(topic) ?? { correct: 0, wrong: 0, students: new Set<string>() };
    current.correct += record.correctAnswers;
    current.wrong += record.wrongAnswers;
    if (record.wrongAnswers > 0 || record.accuracy < 70) current.students.add(record.studentId);
    topicMap.set(topic, current);
  }

  const weakTopics = Array.from(topicMap.entries())
    .map(([topic, value]) => {
      const accuracy = calculateAccuracy(value.correct, value.wrong);
      return {
        topic,
        intensity: round2(Math.max(0, 100 - accuracy)),
        studentsImpacted: value.students.size,
      };
    })
    .filter((topic) => topic.intensity > 0 || topic.studentsImpacted > 0)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 8);

  const totalCorrect = progress.reduce((sum, record) => sum + record.correctAnswers, 0);
  const totalWrong = progress.reduce((sum, record) => sum + record.wrongAnswers, 0);
  const totalQuestSlots = sections.reduce((sum, section) => sum + section.studentSections.length * section.quests.length, 0);
  const completedQuestSlots = progress.filter((record) => record.questCompleted).length;

  return {
    points,
    weakTopics,
    summary: {
      averageTimeSpent: progress.reduce((sum, record) => sum + record.timeSpent, 0),
      accuracy: calculateAccuracy(totalCorrect, totalWrong),
      completion: totalQuestSlots === 0 ? 0 : round2((completedQuestSlots / totalQuestSlots) * 100),
      totalAttempts: progress.length,
    },
  };
}
