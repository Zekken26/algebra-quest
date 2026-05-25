import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsClass } from "../classes/class.service";

type QuestGuideInput = {
  title: string;
  topic: string;
  shortExplanation: string;
  exampleProblem: string;
  solutionSteps: string[];
  tips: string[];
  classId?: string;
  sectionId?: string;
  questId?: string;
};

async function assertTeacherOwnsGuide(teacherId: string, guideId: string) {
  const guide = await prisma.questGuide.findFirst({ where: { id: guideId, teacherId } });

  if (!guide) {
    throw new AppError("Quest guide was not found for this teacher.", 404, "QUEST_GUIDE_NOT_FOUND");
  }

  return guide;
}

function resolveSectionId(input: { classId?: string; sectionId?: string }) {
  if (input.classId && input.sectionId && input.classId !== input.sectionId) {
    throw new AppError("classId and sectionId must refer to the same section.", 400, "SECTION_ID_CONFLICT");
  }

  return input.sectionId ?? input.classId;
}

async function validateTeacherLinks(teacherId: string, input: { classId?: string; sectionId?: string; questId?: string }) {
  const sectionId = resolveSectionId(input);
  if (!sectionId) {
    throw new AppError("sectionId is required.", 400, "SECTION_REQUIRED");
  }

  await assertTeacherOwnsClass(teacherId, sectionId);

  if (input.questId) {
    const quest = await prisma.quest.findFirst({ where: { id: input.questId, teacherId } });

    if (!quest) {
      throw new AppError("Quest was not found for this teacher.", 404, "QUEST_NOT_FOUND");
    }

    if (quest.sectionId !== sectionId) {
      throw new AppError("Featured quest must belong to the same section.", 400, "INVALID_GUIDE_QUEST_SECTION");
    }
  }

  return sectionId;
}

export async function createQuestGuide(teacherId: string, input: QuestGuideInput) {
  const sectionId = await validateTeacherLinks(teacherId, input);
  const { classId: _classId, sectionId: _sectionId, ...data } = input;

  return prisma.questGuide.create({
    data: { ...data, sectionId, teacherId },
    include: { section: true, featuredQuest: true, quests: true },
  });
}

export async function getTeacherQuestGuides(teacherId: string) {
  return prisma.questGuide.findMany({
    where: { teacherId },
    include: { section: true, featuredQuest: true, quests: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateQuestGuide(teacherId: string, guideId: string, input: Partial<QuestGuideInput>) {
  const guide = await assertTeacherOwnsGuide(teacherId, guideId);
  const requestedSectionId = resolveSectionId(input);
  const sectionId = requestedSectionId ?? guide.sectionId;

  if (requestedSectionId || input.questId) {
    await validateTeacherLinks(teacherId, { ...input, sectionId });
  }

  const { classId: _classId, sectionId: _sectionId, ...data } = input;

  return prisma.questGuide.update({
    where: { id: guideId },
    data: { ...data, ...(requestedSectionId ? { sectionId: requestedSectionId } : {}) },
    include: { section: true, featuredQuest: true, quests: true },
  });
}

export async function deleteQuestGuide(teacherId: string, guideId: string) {
  await assertTeacherOwnsGuide(teacherId, guideId);
  await prisma.quest.updateMany({ where: { guideId }, data: { guideId: null } });
  await prisma.questGuide.delete({ where: { id: guideId } });
}

export async function getStudentQuestGuides(studentId: string) {
  return prisma.questGuide.findMany({
    where: { section: { studentSections: { some: { studentId, status: "ACTIVE" } } } },
    include: {
      section: { select: { id: true, name: true } },
      quests: { select: { id: true, title: true, levelNumber: true } },
      featuredQuest: { select: { id: true, title: true, levelNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentQuestGuidesForSection(studentId: string, sectionId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "SECTION_NOT_ENROLLED");
  }

  return prisma.questGuide.findMany({
    where: { sectionId },
    include: {
      quests: { select: { id: true, title: true, levelNumber: true } },
      featuredQuest: { select: { id: true, title: true, levelNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function markGuideViewed(studentId: string, guideId: string) {
  const guide = await prisma.questGuide.findFirst({
    where: { id: guideId, section: { studentSections: { some: { studentId, status: "ACTIVE" } } } },
    include: { quests: true, featuredQuest: true },
  });

  if (!guide) {
    throw new AppError("Quest guide is not assigned to your section.", 403, "GUIDE_NOT_ASSIGNED");
  }

  const questIds = new Set<string>(guide.quests.map((quest) => quest.id));

  if (guide.featuredQuest) {
    questIds.add(guide.featuredQuest.id);
  }

  await Promise.all(
    Array.from(questIds).map(async (questId) => {
      const quest = await prisma.quest.findUniqueOrThrow({ where: { id: questId } });
      await prisma.studentProgress.upsert({
        where: { studentId_sectionId_questId: { studentId, sectionId: guide.sectionId, questId } },
        create: {
          studentId,
          sectionId: guide.sectionId,
          questId,
          guideViewed: true,
          questUnlocked: true,
          heartsRemaining: quest.maxHearts,
        },
        update: { guideViewed: true, questUnlocked: true },
      });
    }),
  );

  return guide;
}
