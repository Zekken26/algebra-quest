import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export type QuestAccessResult = {
  allowed: boolean;
  requiredLevel?: number;
  lockReason?: string;
};

export async function canStudentAccessQuest(
  studentId: string,
  classSectionId: string,
  questId: string,
): Promise<boolean> {
  const result = await getQuestAccess(studentId, classSectionId, questId);
  return result.allowed;
}

export async function getQuestAccess(
  studentId: string,
  classSectionId: string,
  questId: string,
): Promise<QuestAccessResult> {
  const quest = await prisma.quest.findFirst({
    where: { id: questId, sectionId: classSectionId, isPublished: true },
    select: { id: true, levelNumber: true },
  });

  if (!quest) {
    return { allowed: false };
  }

  if (quest.levelNumber === 1) {
    return { allowed: true };
  }

  const previousLevel = quest.levelNumber - 1;
  const previousQuest = await prisma.quest.findFirst({
    where: {
      sectionId: classSectionId,
      levelNumber: previousLevel,
      isPublished: true,
    },
    select: { id: true, levelNumber: true },
  });

  if (!previousQuest) {
    return {
      allowed: false,
      requiredLevel: previousLevel,
      lockReason: `Complete Level ${previousLevel} first.`,
    };
  }

  const previousProgress = await prisma.studentProgress.findUnique({
    where: {
      studentId_sectionId_questId: {
        studentId,
        sectionId: classSectionId,
        questId: previousQuest.id,
      },
    },
    select: { questCompleted: true },
  });

  if (!previousProgress?.questCompleted) {
    return {
      allowed: false,
      requiredLevel: previousQuest.levelNumber,
      lockReason: `Complete Level ${previousQuest.levelNumber} first.`,
    };
  }

  return { allowed: true };
}

export async function assertStudentCanAccessQuest(
  studentId: string,
  classSectionId: string,
  questId: string,
) {
  const access = await getQuestAccess(studentId, classSectionId, questId);

  if (!access.allowed) {
    throw new AppError(
      "Complete the previous quest before starting this quest.",
      403,
      "QUEST_LOCKED",
      {
        locked: true,
        requiredLevel: access.requiredLevel,
        lockReason: access.lockReason,
      },
    );
  }
}

export function applyQuestProgressionStatus<
  T extends {
    id: string;
    levelNumber: number;
    progress?: Array<{ questCompleted: boolean; questUnlocked?: boolean }> | null;
  },
>(quests: T[]) {
  const questByLevel = new Map(quests.map((quest) => [quest.levelNumber, quest]));

  return quests.map((quest) => {
    const progress = quest.progress?.[0] ?? null;
    const completed = Boolean(progress?.questCompleted);
    const previousQuest = questByLevel.get(quest.levelNumber - 1);
    const previousCompleted = Boolean(previousQuest?.progress?.[0]?.questCompleted);
    const locked = quest.levelNumber > 1 && !previousCompleted;
    const status = completed ? "completed" : locked ? "locked" : "unlocked";
    const requiredLevel = locked ? quest.levelNumber - 1 : undefined;

    return {
      ...quest,
      status,
      locked,
      requiredLevel,
      lockReason: locked ? `Complete Level ${requiredLevel} first.` : undefined,
    };
  });
}
