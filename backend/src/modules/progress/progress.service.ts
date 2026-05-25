import { QuestAttemptStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsClass } from "../classes/class.service";
import { assertStudentCanAccessQuest } from "../progression/progression.service";
import { assertHintTokensAvailable, canContinueProgress } from "./progress.rules";

function calculateAccuracy(correctAnswers: number, wrongAnswers: number) {
  const total = correctAnswers + wrongAnswers;
  return total === 0 ? 0 : Number(((correctAnswers / total) * 100).toFixed(2));
}

const publicStudentStatsSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  xp: true,
  coins: true,
  hintTokens: true,
  hearts: true,
};

async function getAssignedQuestForStudent(studentId: string, questId: string, classId?: string) {
  const enrollmentCount = await prisma.enrollment.count({
    where: { studentId, status: "ACTIVE", ...(classId ? { sectionId: classId } : {}) },
  });

  if (enrollmentCount === 0) {
    throw new AppError(
      classId ? "You are not enrolled in this class." : "Join a class first before starting quests.",
      403,
      classId ? "SECTION_NOT_ENROLLED" : "CLASS_ENROLLMENT_REQUIRED",
    );
  }

  const quest = await prisma.quest.findFirst({
    where: {
      id: questId,
      isPublished: true,
      ...(classId ? { sectionId: classId } : {}),
      section: { studentSections: { some: { studentId, status: "ACTIVE" } } },
    },
    include: {
      guide: true,
    },
  });

  if (!quest) {
    throw new AppError("Quest is not assigned to your section.", 403, "QUEST_NOT_ASSIGNED");
  }

  await assertStudentCanAccessQuest(studentId, quest.sectionId, questId);

  return quest;
}

async function summarizeAttemptProgress(
  client: Pick<typeof prisma, "questionProgress">,
  attemptId: string,
  quest: { requiredPuzzlePieces: number; maxHearts: number },
) {
  const rows = await client.questionProgress.findMany({
    where: { attemptId, answeredAt: { not: null } },
    select: { isCorrect: true },
  });
  const correctAnswers = rows.filter((row) => row.isCorrect).length;
  const wrongAnswers = rows.filter((row) => row.isCorrect === false).length;
  const puzzlePieces = Math.min(correctAnswers, quest.requiredPuzzlePieces);
  const heartsRemaining = Math.max(quest.maxHearts - wrongAnswers, 0);
  const questCompleted = puzzlePieces >= quest.requiredPuzzlePieces;

  return {
    score: correctAnswers * 10,
    puzzlePieces,
    heartsRemaining,
    correctAnswers,
    wrongAnswers,
    accuracy: calculateAccuracy(correctAnswers, wrongAnswers),
    questCompleted,
  };
}

async function getNextAttemptNo(studentId: string, questId: string) {
  const latest = await prisma.questAttempt.findFirst({
    where: { studentId, questId },
    select: { attemptNo: true },
    orderBy: { attemptNo: "desc" },
  });

  return (latest?.attemptNo ?? 0) + 1;
}

async function createQuestAttempt(studentId: string, sectionId: string, questId: string) {
  return prisma.questAttempt.create({
    data: {
      studentId,
      sectionId,
      questId,
      attemptNo: await getNextAttemptNo(studentId, questId),
    },
  });
}

async function ensureActiveQuestAttempt(studentId: string, sectionId: string, questId: string) {
  const activeAttempt = await prisma.questAttempt.findFirst({
    where: { studentId, sectionId, questId, status: QuestAttemptStatus.ACTIVE },
    orderBy: { startedAt: "desc" },
  });

  return activeAttempt ?? createQuestAttempt(studentId, sectionId, questId);
}

export async function startQuest(studentId: string, questId: string, classId?: string) {
  const quest = await getAssignedQuestForStudent(studentId, questId, classId);
  const [existing, student, activeAttempt] = await Promise.all([
    prisma.studentProgress.findUnique({
      where: { studentId_sectionId_questId: { studentId, sectionId: quest.sectionId, questId } },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: studentId } }),
    prisma.questAttempt.findFirst({
      where: { studentId, sectionId: quest.sectionId, questId, status: QuestAttemptStatus.ACTIVE },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  if (quest.guideId && !existing?.guideViewed) {
    throw new AppError("View the Quest Guide before starting this quest.", 403, "GUIDE_REQUIRED");
  }

  if (canContinueProgress(existing)) {
    if (!activeAttempt) {
      await createQuestAttempt(studentId, quest.sectionId, questId);
    }

    return existing;
  }

  return prisma.$transaction(async (tx) => {
    if (activeAttempt) {
      await tx.questAttempt.update({
        where: { id: activeAttempt.id },
        data: {
          status: activeAttempt.status === QuestAttemptStatus.ACTIVE ? QuestAttemptStatus.FAILED : activeAttempt.status,
          failedAt: activeAttempt.failedAt ?? new Date(),
        },
      });
    }

    await tx.user.update({
      where: { id: studentId },
      data: { hearts: quest.maxHearts },
    });

    const nextProgress = await tx.studentProgress.upsert({
      where: { studentId_sectionId_questId: { studentId, sectionId: quest.sectionId, questId } },
      create: {
        studentId,
        sectionId: quest.sectionId,
        questId,
        guideViewed: !quest.guideId,
        questUnlocked: true,
        heartsRemaining: quest.maxHearts,
        hintTokens: student.hintTokens,
        coins: student.coins,
        startedAt: new Date(),
      },
      update: {
        questUnlocked: true,
        questCompleted: false,
        score: 0,
        xp: 0,
        coins: student.coins,
        coinsEarned: 0,
        puzzlePieces: 0,
        heartsRemaining: quest.maxHearts,
        hintTokens: student.hintTokens,
        hintsUsed: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        accuracy: 0,
        completedAt: null,
        startedAt: new Date(),
      },
    });

    await tx.questAttempt.create({
      data: {
        studentId,
        sectionId: quest.sectionId,
        questId,
        attemptNo: await getNextAttemptNo(studentId, questId),
      },
    });

    return nextProgress;
  });
}

export async function answerQuestion(
  studentId: string,
  questId: string,
  input: { questionId: string; selectedAnswer: string },
  classId?: string,
) {
  const quest = await getAssignedQuestForStudent(studentId, questId, classId);
  const progress = await prisma.studentProgress.findUnique({
    where: { studentId_sectionId_questId: { studentId, sectionId: quest.sectionId, questId } },
  });

  if (!progress?.questUnlocked) {
    throw new AppError("Start this quest before answering questions.", 409, "QUEST_NOT_STARTED");
  }

  if (progress.heartsRemaining <= 0) {
    throw new AppError("This attempt has failed. Retry the quest after reviewing the Quest Guide.", 409, "NO_HEARTS");
  }

  if (progress.questCompleted) {
    throw new AppError("This quest is already completed.", 409, "QUEST_ALREADY_COMPLETED");
  }

  const question = await prisma.questQuestion.findFirst({ where: { id: input.questionId, questId } });

  if (!question) {
    throw new AppError("Question was not found for this quest.", 404, "QUESTION_NOT_FOUND");
  }

  const activeAttempt = await ensureActiveQuestAttempt(studentId, quest.sectionId, questId);

  const existingQuestionProgress = await prisma.questionProgress.findUnique({
    where: { attemptId_questionId: { attemptId: activeAttempt.id, questionId: question.id } },
    select: { id: true, answeredAt: true },
  });

  const isCorrect = question.correctAnswer.trim().toLowerCase() === input.selectedAnswer.trim().toLowerCase();

  if (existingQuestionProgress?.answeredAt) {
    const duplicateResult = await prisma.$transaction(async (tx) => {
      await tx.answerAttempt.create({
        data: {
          studentId,
          sectionId: quest.sectionId,
          questId,
          questionId: question.id,
          selectedAnswer: input.selectedAnswer,
          isCorrect,
        },
      });

      const [currentProgress, user] = await Promise.all([
        tx.studentProgress.findUniqueOrThrow({ where: { id: progress.id } }),
        tx.user.findUniqueOrThrow({
          where: { id: studentId },
          select: publicStudentStatsSelect,
        }),
      ]);

      return { progress: currentProgress, user };
    });

    return {
      isCorrect,
      progress: duplicateResult.progress,
      user: duplicateResult.user,
      feedback: "This puzzle was already answered. No extra rewards were added.",
    };
  }

  const updatedProgress = await prisma.$transaction(async (tx) => {
    await tx.answerAttempt.create({
      data: {
        studentId,
        sectionId: quest.sectionId,
        questId,
        questionId: question.id,
        selectedAnswer: input.selectedAnswer,
        isCorrect,
      },
    });

    await tx.questionProgress.upsert({
      where: { attemptId_questionId: { attemptId: activeAttempt.id, questionId: question.id } },
      create: {
        attemptId: activeAttempt.id,
        studentId,
        sectionId: quest.sectionId,
        questId,
        questionId: question.id,
        selectedAnswer: input.selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
      update: {
        selectedAnswer: input.selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
    });

    const attemptSummary = await summarizeAttemptProgress(tx, activeAttempt.id, quest);
    const newlyCompleted = attemptSummary.questCompleted && !progress.questCompleted;

    const answerXpReward = isCorrect ? 10 : 0;
    const answerCoinReward = isCorrect ? 10 : 0;
    const updatedUser = await tx.user.update({
      where: { id: studentId },
      data: {
        hearts: attemptSummary.heartsRemaining,
        ...(answerXpReward > 0 ? { xp: { increment: answerXpReward } } : {}),
        ...(answerCoinReward > 0 ? { coins: { increment: answerCoinReward } } : {}),
      },
      select: publicStudentStatsSelect,
    });

    const [nextProgress] = await Promise.all([
      tx.studentProgress.update({
        where: { id: progress.id },
        data: {
          score: attemptSummary.score,
          xp: attemptSummary.correctAnswers * 10,
          coins: updatedUser.coins,
          coinsEarned: attemptSummary.correctAnswers * 10,
          puzzlePieces: attemptSummary.puzzlePieces,
          heartsRemaining: attemptSummary.heartsRemaining,
          correctAnswers: attemptSummary.correctAnswers,
          wrongAnswers: attemptSummary.wrongAnswers,
          accuracy: attemptSummary.accuracy,
          questCompleted: attemptSummary.questCompleted,
          completedAt: attemptSummary.questCompleted ? new Date() : progress.completedAt,
        },
      }),
      attemptSummary.questCompleted || attemptSummary.heartsRemaining === 0
        ? tx.questAttempt.update({
            where: { id: activeAttempt.id },
            data: attemptSummary.questCompleted
              ? { status: QuestAttemptStatus.COMPLETED, completedAt: new Date() }
              : { status: QuestAttemptStatus.FAILED, failedAt: new Date() },
          })
        : Promise.resolve(activeAttempt),
    ]);

    return { progress: nextProgress, user: updatedUser, newlyCompleted };
  });

  return {
    isCorrect,
    progress: updatedProgress.progress,
    user: updatedProgress.user,
    feedback: isCorrect
      ? updatedProgress.progress.questCompleted && updatedProgress.newlyCompleted
        ? "Correct answer. You completed the relic."
        : "Correct answer. You recovered a puzzle piece."
      : updatedProgress.progress.heartsRemaining === 0
        ? "Wrong answer. No hearts remain; review the Quest Guide before retrying."
        : "Wrong answer. You lost one heart.",
  };
}

export async function useHint(studentId: string, questId: string, input: { questionId: string }, classId?: string) {
  const quest = await getAssignedQuestForStudent(studentId, questId, classId);
  const [progress, question, student] = await Promise.all([
    prisma.studentProgress.findUnique({ where: { studentId_sectionId_questId: { studentId, sectionId: quest.sectionId, questId } } }),
    prisma.questQuestion.findFirst({ where: { id: input.questionId, questId } }),
    prisma.user.findUnique({ where: { id: studentId }, select: { hintTokens: true } }),
  ]);

  if (!progress?.questUnlocked) {
    throw new AppError("Start this quest before using hints.", 409, "QUEST_NOT_STARTED");
  }

  if (!question) {
    throw new AppError("Question was not found for this quest.", 404, "QUESTION_NOT_FOUND");
  }

  const activeAttempt = await ensureActiveQuestAttempt(studentId, quest.sectionId, questId);

  const questionProgress = await prisma.questionProgress.findUnique({
    where: { attemptId_questionId: { attemptId: activeAttempt.id, questionId: question.id } },
    select: { hintsRevealed: true },
  });
  const nextHintIndex = questionProgress?.hintsRevealed ?? 0;

  if (nextHintIndex >= question.solutionSteps.length) {
    return {
      hintStep: null,
      hintStepIndex: nextHintIndex,
      noMoreHints: true,
      progress,
    };
  }

  assertHintTokensAvailable(student?.hintTokens ?? 0);

  const updatedProgress = await prisma.$transaction(async (tx) => {
    await tx.questionProgress.upsert({
      where: { attemptId_questionId: { attemptId: activeAttempt.id, questionId: question.id } },
      create: {
        attemptId: activeAttempt.id,
        studentId,
        sectionId: quest.sectionId,
        questId,
        questionId: question.id,
        hintsRevealed: 1,
      },
      update: { hintsRevealed: { increment: 1 } },
    });

    const [nextProgress] = await Promise.all([
      tx.studentProgress.update({
        where: { id: progress.id },
        data: {
          hintsUsed: { increment: 1 },
          hintTokens: Math.max((student?.hintTokens ?? 0) - 1, 0),
        },
      }),
      tx.user.update({
        where: { id: studentId },
        data: { hintTokens: { decrement: 1 } },
      }),
    ]);

    return nextProgress;
  });

  return {
    hintStep: question.solutionSteps[nextHintIndex],
    hintStepIndex: nextHintIndex,
    noMoreHints: false,
    progress: updatedProgress,
  };
}

export async function completeQuest(studentId: string, questId: string, input: { timeSpent?: number }, classId?: string) {
  const quest = await getAssignedQuestForStudent(studentId, questId, classId);
  const progress = await prisma.studentProgress.findUnique({
    where: { studentId_sectionId_questId: { studentId, sectionId: quest.sectionId, questId } },
  });

  if (!progress) {
    throw new AppError("Start this quest before completing it.", 409, "QUEST_NOT_STARTED");
  }

  if (progress.puzzlePieces < quest.requiredPuzzlePieces) {
    throw new AppError("Collect all required puzzle pieces before completing this level.", 409, "PUZZLES_REQUIRED");
  }

  return prisma.$transaction(async (tx) => {
    const completedAt = progress.completedAt ?? new Date();
    const [nextProgress] = await Promise.all([
      tx.studentProgress.update({
        where: { id: progress.id },
        data: {
          questCompleted: true,
          completedAt,
          timeSpent: input.timeSpent ?? progress.timeSpent,
        },
      }),
      tx.questAttempt.updateMany({
        where: { studentId, sectionId: quest.sectionId, questId, status: QuestAttemptStatus.ACTIVE },
        data: { status: QuestAttemptStatus.COMPLETED, completedAt },
      }),
    ]);

    return nextProgress;
  });
}

export async function getClassProgress(teacherId: string, classId: string) {
  await assertTeacherOwnsClass(teacherId, classId);

  return prisma.studentProgress.findMany({
    where: { sectionId: classId },
    include: {
      student: { select: { id: true, name: true, email: true, avatarUrl: true } },
      quest: { select: { id: true, title: true, topic: true, levelNumber: true } },
    },
    orderBy: [{ quest: { levelNumber: "asc" } }, { updatedAt: "desc" }],
  });
}
