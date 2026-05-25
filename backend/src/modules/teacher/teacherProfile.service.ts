import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

const teacherProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
};

export async function getTeacherProfile(teacherId: string) {
  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: "TEACHER" },
    select: teacherProfileSelect,
  });

  if (!teacher) {
    throw new AppError("Teacher profile was not found.", 404, "TEACHER_NOT_FOUND");
  }

  return teacher;
}

export async function updateTeacherProfile(
  teacherId: string,
  input: { name?: string; email?: string },
) {
  await getTeacherProfile(teacherId);

  if (input.email) {
    const duplicateEmail = await prisma.user.findFirst({
      where: { email: input.email, NOT: { id: teacherId } },
      select: { id: true },
    });

    if (duplicateEmail) {
      throw new AppError("A user with this email already exists.", 409, "EMAIL_ALREADY_EXISTS");
    }
  }

  return prisma.user.update({
    where: { id: teacherId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email } : {}),
    },
    select: teacherProfileSelect,
  });
}

export async function changeTeacherPassword(
  teacherId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: "TEACHER" },
    select: { id: true, password: true },
  });

  if (!teacher) {
    throw new AppError("Teacher profile was not found.", 404, "TEACHER_NOT_FOUND");
  }

  const passwordMatches = await bcrypt.compare(input.currentPassword, teacher.password);

  if (!passwordMatches) {
    throw new AppError("Current password is incorrect.", 403, "CURRENT_PASSWORD_INVALID");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);

  await prisma.user.update({
    where: { id: teacherId },
    data: { password: passwordHash },
    select: { id: true },
  });
}

export async function updateTeacherAvatar(teacherId: string, avatarUrl: string) {
  await getTeacherProfile(teacherId);

  return prisma.user.update({
    where: { id: teacherId },
    data: { avatarUrl },
    select: teacherProfileSelect,
  });
}
