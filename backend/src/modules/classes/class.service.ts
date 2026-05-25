import { UserRole } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

const studentSelect = { id: true, name: true, email: true, avatarUrl: true };

function shapeSection<T extends { studentSections?: Array<{ joinedAt: Date; status?: string; student: unknown }> }>(section: T) {
  const { studentSections = [], ...rest } = section;
  return {
    ...rest,
    students: studentSections.map((enrollment) => ({
      ...(enrollment.student as object),
      joinedAt: enrollment.joinedAt,
      status: enrollment.status,
    })),
  };
}

async function generateUniqueSectionCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
    const existing = await prisma.classSection.findUnique({ where: { code }, select: { id: true } });
    if (!existing) return code;
  }

  throw new AppError("Unable to generate a unique section code. Please try again.", 500, "SECTION_CODE_GENERATION_FAILED");
}

export async function assertTeacherOwnsClass(teacherId: string, classId: string) {
  const section = await prisma.classSection.findFirst({ where: { id: classId, teacherId } });

  if (!section) {
    throw new AppError("Section was not found for this teacher.", 404, "SECTION_NOT_FOUND");
  }

  return section;
}

export async function createClass(teacherId: string, input: { name: string; description?: string | null }) {
  const duplicate = await prisma.classSection.findFirst({
    where: { teacherId, name: { equals: input.name, mode: "insensitive" } },
    select: { id: true },
  });

  if (duplicate) {
    throw new AppError("A section with this name already exists.", 409, "SECTION_NAME_DUPLICATE");
  }

  const section = await prisma.classSection.create({
    data: { name: input.name, description: input.description ?? null, code: await generateUniqueSectionCode(), teacherId },
    include: { studentSections: { include: { student: { select: studentSelect } } } },
  });

  return shapeSection(section);
}

export async function updateClass(
  teacherId: string,
  classId: string,
  input: { name?: string; description?: string | null },
) {
  await assertTeacherOwnsClass(teacherId, classId);

  if (input.name) {
    const duplicate = await prisma.classSection.findFirst({
      where: { teacherId, name: { equals: input.name, mode: "insensitive" }, NOT: { id: classId } },
      select: { id: true },
    });

    if (duplicate) {
      throw new AppError("A section with this name already exists.", 409, "SECTION_NAME_DUPLICATE");
    }
  }

  const section = await prisma.classSection.update({
    where: { id: classId },
    data: input,
    include: { studentSections: { where: { status: "ACTIVE" }, include: { student: { select: studentSelect } } } },
  });

  return shapeSection(section);
}

export async function deleteClass(teacherId: string, classId: string) {
  await assertTeacherOwnsClass(teacherId, classId);

  const dependencies = await prisma.classSection.findUnique({
    where: { id: classId },
    select: {
      _count: { select: { studentSections: true, questGuides: true, quests: true, progressRecords: true } },
    },
  });

  const count = dependencies?._count;
  if (count && (count.studentSections > 0 || count.questGuides > 0 || count.quests > 0 || count.progressRecords > 0)) {
    throw new AppError("Section cannot be deleted while it has students, quests, guides, or progress.", 409, "SECTION_HAS_DEPENDENCIES");
  }

  await prisma.classSection.delete({ where: { id: classId } });
}

export async function getTeacherClasses(teacherId: string) {
  return prisma.classSection.findMany({
    where: { teacherId },
    include: {
      _count: { select: { studentSections: true, questGuides: true, quests: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeacherClass(teacherId: string, classId: string) {
  await assertTeacherOwnsClass(teacherId, classId);

  const section = await prisma.classSection.findUnique({
    where: { id: classId },
    include: {
      studentSections: {
        where: { status: "ACTIVE" },
        include: { student: { select: studentSelect } },
        orderBy: { student: { name: "asc" } },
      },
      questGuides: true,
      quests: { include: { questions: true, guide: true } },
    },
  });

  if (!section) {
    throw new AppError("Section was not found.", 404, "SECTION_NOT_FOUND");
  }

  return shapeSection(section);
}

export async function addStudentToClass(teacherId: string, classId: string, input: { studentId?: string; email?: string }) {
  await assertTeacherOwnsClass(teacherId, classId);

  const student = await prisma.user.findFirst({
    where: {
      role: UserRole.STUDENT,
      OR: [{ id: input.studentId ?? "" }, { email: input.email ?? "" }],
    },
  });

  if (!student) {
    throw new AppError("Student was not found.", 404, "STUDENT_NOT_FOUND");
  }

  const duplicate = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId: student.id, sectionId: classId } },
    select: { id: true, status: true },
  });

  if (duplicate?.status === "ACTIVE") {
    throw new AppError("Student is already enrolled in this section.", 409, "DUPLICATE_ENROLLMENT");
  }

  if (duplicate) {
    await prisma.enrollment.update({
      where: { studentId_sectionId: { studentId: student.id, sectionId: classId } },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
  } else {
    await prisma.enrollment.create({ data: { studentId: student.id, sectionId: classId } });
  }
  return getTeacherClass(teacherId, classId);
}

export async function studentBelongsToQuestClass(studentId: string, questId: string) {
  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    include: {
      section: { select: { studentSections: { where: { studentId, status: "ACTIVE" }, select: { id: true } } } },
    },
  });

  if (!quest) {
    throw new AppError("Quest was not found.", 404, "QUEST_NOT_FOUND");
  }

  if (quest.section.studentSections.length === 0) {
    throw new AppError("This quest is not assigned to your section.", 403, "QUEST_NOT_ASSIGNED");
  }

  return quest;
}
