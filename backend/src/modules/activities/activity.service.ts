import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsSection } from "../teacher/teacher.ownership";
import type { ActivityType, Prisma } from "@prisma/client";

function resolveSectionId(input: { classId?: string | null; sectionId?: string | null }) {
  if (input.classId && input.sectionId && input.classId !== input.sectionId) {
    throw new AppError("classId and sectionId must refer to the same section.", 400, "SECTION_ID_CONFLICT");
  }
  return input.sectionId ?? input.classId;
}

const activityInclude = {
  quest: {
    select: {
      id: true,
      title: true,
      worldName: true,
      topic: true,
      difficulty: true,
      levelNumber: true,
      isPublished: true,
      _count: { select: { questions: true, progress: true } },
    },
  },
  content: {
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  },
  _count: { select: { submissions: true } },
};

export async function createActivity(
  teacherId: string,
  input: {
    type: ActivityType;
    title: string;
    description?: string | null;
    instructions?: string | null;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    totalPoints?: number | null;
    isPublished?: boolean;
    classId?: string | null;
    sectionId?: string | null;
  },
) {
  const sectionId = resolveSectionId(input);
  if (!sectionId) throw new AppError("sectionId or classId is required.", 400, "SECTION_REQUIRED");
  await assertTeacherOwnsSection(teacherId, sectionId);

  const data: Prisma.ActivityCreateInput = {
    type: input.type,
    title: input.title,
    description: input.description ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
    availableTo: input.availableTo ? new Date(input.availableTo) : null,
    totalPoints: input.totalPoints ?? null,
    isPublished: input.isPublished ?? false,
    teacher: { connect: { id: teacherId } },
    section: { connect: { id: sectionId } },
  };

  const activity = await prisma.activity.create({
    data,
    include: activityInclude,
  });

  return activity;
}

export async function getClassActivities(teacherId: string, sectionId: string, type?: string) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const where: Prisma.ActivityWhereInput = { sectionId };
  if (type) where.type = type as ActivityType;

  const activities = await prisma.activity.findMany({
    where,
    include: activityInclude,
    orderBy: { orderIndex: "asc" },
  });

  return activities;
}

export async function getActivityDetail(teacherId: string, activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      ...activityInclude,
      content: {
        include: {
          questions: true,
          attempts: {
            include: {
              student: { select: { id: true, name: true, email: true } },
            },
            orderBy: { startedAt: "desc" },
          },
        },
      },
      submissions: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!activity) throw new AppError("Activity was not found.", 404, "ACTIVITY_NOT_FOUND");
  if (activity.teacherId !== teacherId) throw new AppError("You cannot view another teacher's activity.", 403, "ACTIVITY_FORBIDDEN");

  return activity;
}

export async function updateActivity(
  teacherId: string,
  activityId: string,
  input: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    totalPoints?: number | null;
    isPublished?: boolean;
  },
) {
  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, teacherId: true },
  });

  if (!existing) throw new AppError("Activity was not found.", 404, "ACTIVITY_NOT_FOUND");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's activity.", 403, "ACTIVITY_FORBIDDEN");

  const data: Prisma.ActivityUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.availableFrom !== undefined) data.availableFrom = input.availableFrom ? new Date(input.availableFrom) : null;
  if (input.availableTo !== undefined) data.availableTo = input.availableTo ? new Date(input.availableTo) : null;
  if (input.totalPoints !== undefined) data.totalPoints = input.totalPoints;
  if (input.isPublished !== undefined) data.isPublished = input.isPublished;

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data,
    include: activityInclude,
  });

  return activity;
}

export async function toggleActivityPublish(teacherId: string, activityId: string) {
  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, teacherId: true, isPublished: true },
  });

  if (!existing) throw new AppError("Activity was not found.", 404, "ACTIVITY_NOT_FOUND");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot modify another teacher's activity.", 403, "ACTIVITY_FORBIDDEN");

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: { isPublished: !existing.isPublished },
    include: activityInclude,
  });

  return activity;
}

export async function deleteActivity(teacherId: string, activityId: string) {
  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, teacherId: true },
  });

  if (!existing) throw new AppError("Activity was not found.", 404, "ACTIVITY_NOT_FOUND");
  if (existing.teacherId !== teacherId) throw new AppError("You cannot delete another teacher's activity.", 403, "ACTIVITY_FORBIDDEN");

  await prisma.activity.delete({ where: { id: activityId } });
}

export async function getStudentActivities(studentId: string, sectionId: string, type?: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  const where: Prisma.ActivityWhereInput = { sectionId, isPublished: true };
  if (type) where.type = type as ActivityType;

  const activities = await prisma.activity.findMany({
    where,
    include: {
      quest: {
        select: {
          id: true,
          title: true,
          worldName: true,
          topic: true,
          difficulty: true,
          levelNumber: true,
          requiredPuzzlePieces: true,
        },
      },
      content: {
        include: {
          _count: { select: { questions: true } },
        },
      },
      submissions: {
        where: { studentId },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  return activities;
}

export async function getStudentActivityDetail(studentId: string, activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId, isPublished: true },
    include: {
      quest: {
        select: {
          id: true,
          title: true,
          worldName: true,
          topic: true,
          difficulty: true,
          levelNumber: true,
          requiredPuzzlePieces: true,
        },
      },
      content: {
        include: {
          questions: {
            select: {
              id: true,
              equation: true,
              choices: true,
              points: true,
              difficulty: true,
              imageUrl: true,
            },
            orderBy: { id: "asc" },
          },
        },
      },
      submissions: {
        where: { studentId },
      },
    },
  });

  if (!activity) throw new AppError("Activity was not found.", 404, "ACTIVITY_NOT_FOUND");

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId: activity.sectionId } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  return activity;
}
