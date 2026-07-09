import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export async function assertTeacherOwnsSection(teacherId: string, sectionId: string) {
  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    select: { id: true, teacherId: true, name: true },
  });

  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }

  if (section.teacherId !== teacherId) {
    throw new AppError("You cannot access another teacher's section.", 403, "SECTION_FORBIDDEN");
  }

  return section;
}

export const ensureTeacherOwnsSection = assertTeacherOwnsSection;

export async function assertTeacherOwnsGuide(teacherId: string, guideId: string) {
  const guide = await prisma.questGuide.findUnique({
    where: { id: guideId },
    select: { id: true, teacherId: true, sectionId: true, questId: true },
  });

  if (!guide) {
    throw new AppError("Quest guide was not found.", 404, "QUEST_GUIDE_NOT_FOUND");
  }

  if (guide.teacherId !== teacherId) {
    throw new AppError("You cannot access another teacher's quest guide.", 403, "QUEST_GUIDE_FORBIDDEN");
  }

  return guide;
}

export async function assertTeacherOwnsQuest(teacherId: string, questId: string) {
  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    select: { id: true, teacherId: true, sectionId: true, guideId: true, difficulty: true },
  });

  if (!quest) {
    throw new AppError("Quest was not found.", 404, "QUEST_NOT_FOUND");
  }

  if (quest.teacherId !== teacherId) {
    throw new AppError("You cannot access another teacher's quest.", 403, "QUEST_FORBIDDEN");
  }

  return quest;
}

export async function assertTeacherOwnsQuestion(teacherId: string, questionId: string) {
  const question = await prisma.questQuestion.findUnique({
    where: { id: questionId },
    include: {
      quest: { select: { id: true, teacherId: true, sectionId: true, guideId: true } },
    },
  });

  if (!question) {
    throw new AppError("Question was not found.", 404, "QUESTION_NOT_FOUND");
  }

  if (question.quest.teacherId !== teacherId) {
    throw new AppError("You cannot modify another teacher's question.", 403, "QUESTION_FORBIDDEN");
  }

  return question;
}

export async function assertTeacherCanViewStudent(teacherId: string, studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      xp: true,
      coins: true,
      lastLoginAt: true,
      studentSections: {
        where: { status: "ACTIVE", section: { teacherId } },
        select: { section: { select: { id: true, name: true } } },
      },
    },
  });

  if (!student || student.role !== "STUDENT") {
    throw new AppError("Student was not found.", 404, "STUDENT_NOT_FOUND");
  }

  if (student.studentSections.length === 0) {
    throw new AppError("You cannot view progress for a student outside your sections.", 403, "STUDENT_FORBIDDEN");
  }

  return student;
}
