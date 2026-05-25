import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { calculateLeaderboardScore } from "../../utils/calculateLeaderboardScore";
import { applyQuestProgressionStatus, assertStudentCanAccessQuest } from "../progression/progression.service";

function round2(value: number) {
  return Number(value.toFixed(2));
}

function calculateAccuracy(correctAnswers: number, wrongAnswers: number) {
  const totalAnswers = correctAnswers + wrongAnswers;
  return totalAnswers === 0 ? 0 : round2((correctAnswers / totalAnswers) * 100);
}

export async function getStudentDashboard(studentId: string) {
  const [student, progress] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        xp: true,
        coins: true,
        hintTokens: true,
        hearts: true,
        studentSections: {
          where: { status: "ACTIVE" },
          select: {
            status: true,
            joinedAt: true,
            section: { select: { id: true, name: true, description: true, code: true, teacher: { select: { id: true, name: true } } } },
          },
          orderBy: { section: { name: "asc" } },
        },
      },
    }),
    prisma.studentProgress.findMany({
      where: { studentId, section: { studentSections: { some: { studentId, status: "ACTIVE" } } } },
      include: { quest: { select: { id: true, title: true, topic: true, levelNumber: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const completedQuests = progress.filter((item) => item.questCompleted).length;
  const activeSections = student?.studentSections ?? [];

  return {
    student,
    enrollment: {
      hasJoinedClass: activeSections.length > 0,
      sections: activeSections.map((enrollment) => ({
        ...enrollment.section,
        joinedAt: enrollment.joinedAt,
        status: enrollment.status,
      })),
    },
    stats: {
      totalScore: progress.reduce((sum, item) => sum + item.score, 0),
      totalXp: progress.reduce((sum, item) => sum + item.xp, 0),
      completedQuests,
      activeQuests: progress.length - completedQuests,
    },
    progress,
  };
}

export async function getStudentEnrollmentStatus(studentId: string) {
  const sections = await getStudentSections(studentId);

  return {
    hasJoinedClass: sections.length > 0,
    sections,
    message: sections.length > 0 ? "Student has joined at least one class." : "Join a class first before starting quests.",
  };
}

async function ensureStudentAccount(studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, role: true },
  });

  if (!student) {
    throw new AppError("Student account was not found.", 404, "STUDENT_NOT_FOUND");
  }

  if (student.role !== "STUDENT") {
    throw new AppError("Only students can join classes.", 403, "STUDENTS_ONLY");
  }

  return student;
}

export async function ensureStudentInSection(studentId: string, sectionId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
    select: { id: true, status: true, section: { select: { id: true, name: true, description: true, code: true } } },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "SECTION_NOT_ENROLLED");
  }

  return enrollment.section;
}

export async function getStudentSections(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    select: {
      joinedAt: true,
      status: true,
      section: {
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          teacher: { select: { id: true, name: true } },
          _count: { select: { questGuides: true, quests: true } },
        },
      },
    },
    orderBy: { section: { name: "asc" } },
  });

  return enrollments.map((enrollment) => ({
    ...enrollment.section,
    joinedAt: enrollment.joinedAt,
    status: enrollment.status,
  }));
}

export async function joinSectionByCode(studentId: string, sectionCode: string) {
  await ensureStudentAccount(studentId);

  const section = await prisma.classSection.findUnique({
    where: { code: sectionCode.toUpperCase() },
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      teacher: { select: { id: true, name: true } },
    },
  });

  if (!section) {
    throw new AppError("Class code was not found.", 404, "CLASS_CODE_NOT_FOUND");
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId: section.id } },
    select: { status: true },
  });

  if (existing?.status === "ACTIVE") {
    throw new AppError("You are already enrolled in this class.", 409, "DUPLICATE_ENROLLMENT");
  }

  const enrollment = existing
    ? await prisma.enrollment.update({
        where: { studentId_sectionId: { studentId, sectionId: section.id } },
        data: { status: "ACTIVE", joinedAt: new Date() },
      })
    : await prisma.enrollment.create({
        data: { studentId, sectionId: section.id },
      });

  return { ...section, joinedAt: enrollment.joinedAt, status: enrollment.status };
}

export async function getStudentSection(studentId: string, sectionId: string) {
  await ensureStudentInSection(studentId, sectionId);

  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      teacher: { select: { id: true, name: true } },
      studentSections: {
        where: { studentId, status: "ACTIVE" },
        select: { joinedAt: true, status: true },
      },
      _count: { select: { questGuides: true, quests: true } },
    },
  });

  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }

  const [enrollment] = section.studentSections;
  const { studentSections: _studentSections, ...data } = section;

  return { ...data, joinedAt: enrollment?.joinedAt, status: enrollment?.status };
}

export async function getStudentSectionQuestGuides(studentId: string, sectionId: string) {
  await ensureStudentInSection(studentId, sectionId);

  return prisma.questGuide.findMany({
    where: { sectionId },
    include: {
      featuredQuest: { select: { id: true, title: true, levelNumber: true } },
      quests: { where: { isPublished: true }, select: { id: true, title: true, levelNumber: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
}

export async function getStudentSectionQuests(studentId: string, sectionId: string) {
  await ensureStudentInSection(studentId, sectionId);

  const quests = await prisma.quest.findMany({
    where: {
      sectionId,
      isPublished: true,
    },
    include: {
      guide: { select: { id: true, title: true } },
      progress: { where: { studentId, sectionId } },
      _count: { select: { questions: true } },
    },
    orderBy: [{ levelNumber: "asc" }, { title: "asc" }],
  });

  return applyQuestProgressionStatus(quests);
}

export async function getStudentSectionQuest(studentId: string, sectionId: string, questId: string) {
  await ensureStudentInSection(studentId, sectionId);
  await assertStudentCanAccessQuest(studentId, sectionId, questId);

  const quest = await prisma.quest.findFirst({
    where: { id: questId, sectionId, isPublished: true },
    include: {
      section: { select: { id: true, name: true } },
      guide: true,
      questions: { select: { id: true, equation: true, choices: true, difficulty: true } },
      progress: { where: { studentId, sectionId } },
    },
  });

  if (!quest) {
    throw new AppError("Quest is not assigned to your section.", 403, "QUEST_NOT_ASSIGNED");
  }

  return applyQuestProgressionStatus([quest])[0];
}

export async function getStudentSectionProgress(studentId: string, sectionId: string) {
  const section = await ensureStudentInSection(studentId, sectionId);
  const quests = await prisma.quest.findMany({
    where: { sectionId, isPublished: true },
    select: {
      id: true,
      title: true,
      topic: true,
      levelNumber: true,
      requiredPuzzlePieces: true,
    },
    orderBy: [{ levelNumber: "asc" }, { title: "asc" }],
  });
  const questIds = quests.map((quest) => quest.id);
  const progress = await prisma.studentProgress.findMany({
    where: { studentId, sectionId, questId: { in: questIds } },
  });
  const progressByQuest = new Map(progress.map((record) => [record.questId, record]));
  const totalCorrect = progress.reduce((sum, item) => sum + item.correctAnswers, 0);
  const totalWrong = progress.reduce((sum, item) => sum + item.wrongAnswers, 0);
  const totalAnswers = totalCorrect + totalWrong;
  const completedQuests = progress.filter((item) => item.questCompleted).length;

  return {
    section,
    summary: {
      totalQuests: quests.length,
      completedQuests,
      completionProgress: quests.length === 0 ? 0 : Number(((completedQuests / quests.length) * 100).toFixed(2)),
      accuracy: totalAnswers === 0 ? 0 : Number(((totalCorrect / totalAnswers) * 100).toFixed(2)),
      timeSpent: progress.reduce((sum, item) => sum + item.timeSpent, 0),
      xpEarned: progress.reduce((sum, item) => sum + item.xp, 0),
      coinsEarned: progress.reduce((sum, item) => sum + item.coinsEarned, 0),
    },
    quests: quests.map((quest) => ({ quest, progress: progressByQuest.get(quest.id) ?? null })),
  };
}

export async function getStudentSectionLeaderboard(studentId: string, sectionId: string) {
  const section = await ensureStudentInSection(studentId, sectionId);
  const [enrollments, quests, progress] = await Promise.all([
    prisma.enrollment.findMany({
      where: { sectionId, status: "ACTIVE" },
      select: {
        student: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { student: { name: "asc" } },
    }),
    prisma.quest.findMany({
      where: { sectionId, isPublished: true },
      select: { id: true, requiredPuzzlePieces: true },
    }),
    prisma.studentProgress.findMany({ where: { sectionId } }),
  ]);

  const totalQuests = quests.length;
  const maxScore = quests.reduce((sum, quest) => sum + quest.requiredPuzzlePieces * 10, 0);
  const questIds = new Set(quests.map((quest) => quest.id));

  const leaderboard = enrollments
    .map((enrollment) => {
      const studentProgress = progress.filter(
        (record) => record.studentId === enrollment.student.id && questIds.has(record.questId),
      );
      const totalScore = studentProgress.reduce((sum, record) => sum + record.score, 0);
      const completedQuests = studentProgress.filter((record) => record.questCompleted).length;
      const correctAnswers = studentProgress.reduce((sum, record) => sum + record.correctAnswers, 0);
      const wrongAnswers = studentProgress.reduce((sum, record) => sum + record.wrongAnswers, 0);
      const accuracy = calculateAccuracy(correctAnswers, wrongAnswers);
      const totalTimeSpent = studentProgress.reduce((sum, record) => sum + record.timeSpent, 0);

      return {
        student: enrollment.student,
        totalScore,
        completedQuests,
        totalQuests,
        completionProgress: totalQuests === 0 ? 0 : round2((completedQuests / totalQuests) * 100),
        accuracy,
        totalTimeSpent,
        xpEarned: studentProgress.reduce((sum, record) => sum + record.xp, 0),
        coinsEarned: studentProgress.reduce((sum, record) => sum + record.coinsEarned, 0),
        overallScore: calculateLeaderboardScore({
          score: Math.min(totalScore, maxScore),
          maxScore,
          completedQuests,
          totalQuests,
          accuracy,
        }),
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

  return { section, leaderboard };
}

type UpdateStudentProfileInput = {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  xp: true,
  coins: true,
  hintTokens: true,
  hearts: true,
  createdAt: true,
  updatedAt: true,
};

export async function updateStudentProfile(studentId: string, input: UpdateStudentProfileInput) {
  if (input.email) {
    const existingUser = await prisma.user.findFirst({
      where: { email: input.email, NOT: { id: studentId } },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError("A user with this email already exists.", 409, "EMAIL_ALREADY_EXISTS");
    }
  }

  return prisma.user.update({
    where: { id: studentId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
    select: publicUserSelect,
  });
}
