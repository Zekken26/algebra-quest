import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsClass } from "../classes/class.service";
import { applyQuestProgressionStatus, assertStudentCanAccessQuest } from "../progression/progression.service";

type QuestQuestionInput = {
  equation: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  solutionSteps: string[];
  difficulty?: string;
};

type QuestInput = {
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
  classId?: string;
  sectionId?: string;
  guideId?: string;
  questions?: QuestQuestionInput[];
};

export async function assertTeacherOwnsQuest(teacherId: string, questId: string) {
  const quest = await prisma.quest.findFirst({ where: { id: questId, teacherId } });

  if (!quest) {
    throw new AppError("Quest was not found for this teacher.", 404, "QUEST_NOT_FOUND");
  }

  return quest;
}

function resolveSectionId(input: { classId?: string; sectionId?: string }) {
  if (input.classId && input.sectionId && input.classId !== input.sectionId) {
    throw new AppError("classId and sectionId must refer to the same section.", 400, "SECTION_ID_CONFLICT");
  }

  return input.sectionId ?? input.classId;
}

async function validateTeacherQuestLinks(teacherId: string, input: { classId?: string; sectionId?: string; guideId?: string }) {
  const sectionId = resolveSectionId(input);
  if (!sectionId) {
    throw new AppError("sectionId is required.", 400, "SECTION_REQUIRED");
  }

  await assertTeacherOwnsClass(teacherId, sectionId);

  if (input.guideId) {
    const guide = await prisma.questGuide.findFirst({ where: { id: input.guideId, teacherId } });

    if (!guide) {
      throw new AppError("Quest guide was not found for this teacher.", 404, "QUEST_GUIDE_NOT_FOUND");
    }

    if (guide.sectionId !== sectionId) {
      throw new AppError("Quest guide must belong to the same section.", 400, "INVALID_QUEST_GUIDE_SECTION");
    }
  }

  return sectionId;
}

async function ensureStudentHasActiveEnrollment(studentId: string) {
  const enrollmentCount = await prisma.enrollment.count({ where: { studentId, status: "ACTIVE" } });

  if (enrollmentCount === 0) {
    throw new AppError("Join a class first before starting quests.", 403, "CLASS_ENROLLMENT_REQUIRED");
  }
}

export async function createQuest(teacherId: string, input: QuestInput) {
  const sectionId = await validateTeacherQuestLinks(teacherId, input);
  const { questions = [], classId: _classId, sectionId: _sectionId, ...questData } = input;

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
      questions: { create: questions.map((question) => ({ ...question, difficulty: input.difficulty })) },
    },
    include: { questions: true, guide: true, section: true },
  });
}

export async function getTeacherQuests(teacherId: string) {
  return prisma.quest.findMany({
    where: { teacherId },
    include: { questions: true, guide: true, section: true },
    orderBy: [{ levelNumber: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTeacherQuest(teacherId: string, questId: string) {
  await assertTeacherOwnsQuest(teacherId, questId);

  return prisma.quest.findUnique({
    where: { id: questId },
    include: { questions: true, guide: true, section: true },
  });
}

export async function updateQuest(teacherId: string, questId: string, input: Partial<QuestInput>) {
  const quest = await assertTeacherOwnsQuest(teacherId, questId);
  const requestedSectionId = resolveSectionId(input);
  const sectionId = requestedSectionId ?? quest.sectionId;

  if (requestedSectionId || input.guideId) {
    await validateTeacherQuestLinks(teacherId, { ...input, sectionId });
  }

  const { questions, classId: _classId, sectionId: _sectionId, ...questData } = input;

  return prisma.$transaction(async (tx) => {
    if (requestedSectionId && requestedSectionId !== quest.sectionId) {
      const progressCount = await tx.studentProgress.count({ where: { questId } });
      if (progressCount > 0) {
        throw new AppError("Quest section cannot be changed after student progress exists.", 409, "QUEST_HAS_PROGRESS");
      }
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
      include: { questions: true, guide: true, section: true },
    });
  });
}

export async function deleteQuest(teacherId: string, questId: string) {
  await assertTeacherOwnsQuest(teacherId, questId);
  const progressCount = await prisma.studentProgress.count({ where: { questId } });

  if (progressCount > 0) {
    throw new AppError("Quest cannot be deleted after student progress exists.", 409, "QUEST_HAS_PROGRESS");
  }

  await prisma.$transaction(async (tx) => {
    const quest = await tx.quest.findUnique({
      where: { id: questId },
      select: { sectionId: true },
    });

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

export async function getStudentQuests(studentId: string) {
  await ensureStudentHasActiveEnrollment(studentId);

  const quests = await prisma.quest.findMany({
    where: {
      isPublished: true,
      section: { studentSections: { some: { studentId, status: "ACTIVE" } } },
    },
    include: {
      guide: true,
      section: { select: { id: true, name: true } },
      progress: { where: { studentId } },
      _count: { select: { questions: true } },
    },
    orderBy: [{ section: { name: "asc" } }, { levelNumber: "asc" }, { createdAt: "desc" }],
  });

  const questsBySection = new Map<string, typeof quests>();
  for (const quest of quests) {
    const sectionQuests = questsBySection.get(quest.sectionId) ?? [];
    sectionQuests.push(quest);
    questsBySection.set(quest.sectionId, sectionQuests);
  }

  return Array.from(questsBySection.values()).flatMap((sectionQuests) =>
    applyQuestProgressionStatus(sectionQuests),
  );
}

export async function getStudentQuest(studentId: string, questId: string) {
  await ensureStudentHasActiveEnrollment(studentId);

  const questAccessTarget = await prisma.quest.findFirst({
    where: {
      id: questId,
      isPublished: true,
      section: { studentSections: { some: { studentId, status: "ACTIVE" } } },
    },
    select: { id: true, sectionId: true },
  });

  if (!questAccessTarget) {
    throw new AppError("Quest is not assigned to your section.", 403, "QUEST_NOT_ASSIGNED");
  }

  await assertStudentCanAccessQuest(studentId, questAccessTarget.sectionId, questId);

  const quest = await prisma.quest.findFirst({
    where: {
      id: questId,
      isPublished: true,
      sectionId: questAccessTarget.sectionId,
    },
    include: {
      section: { select: { id: true, name: true } },
      guide: true,
      questions: { select: { id: true, equation: true, choices: true, difficulty: true } },
      progress: { where: { studentId } },
    },
  });

  if (!quest) {
    throw new AppError("Quest is not assigned to your section.", 403, "QUEST_NOT_ASSIGNED");
  }

  return applyQuestProgressionStatus([quest])[0];
}
