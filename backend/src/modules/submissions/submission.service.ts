import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { assertTeacherOwnsSection } from "../teacher/teacher.ownership";

export async function getContentSubmissions(teacherId: string, contentId: string) {
  const content = await prisma.classContent.findUnique({
    where: { id: contentId },
    select: { id: true, teacherId: true, sectionId: true, title: true },
  });

  if (!content) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");
  if (content.teacherId !== teacherId)
    throw new AppError("You cannot view another teacher's content.", 403, "CONTENT_FORBIDDEN");

  const submissions = await prisma.activitySubmission.findMany({
    where: {
      activity: { contentId },
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return submissions.map((s) => ({
    id: s.id,
    studentId: s.studentId,
    studentName: s.student.name,
    studentEmail: s.student.email,
    status: s.status,
    score: s.score,
    maxScore: s.maxScore,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt,
    teacherFeedback: s.teacherFeedback,
  }));
}

export async function getSectionSubmissions(
  teacherId: string,
  sectionId: string,
  status?: string,
) {
  await assertTeacherOwnsSection(teacherId, sectionId);

  const where: Record<string, unknown> = {
    activity: { sectionId },
  };
  if (status) where.status = status;

  const submissions = await prisma.activitySubmission.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true } },
      activity: { select: { id: true, title: true, type: true, contentId: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return submissions.map((s) => ({
    id: s.id,
    activityId: s.activityId,
    activityTitle: s.activity.title,
    activityType: s.activity.type,
    studentId: s.studentId,
    studentName: s.student.name,
    studentEmail: s.student.email,
    status: s.status,
    score: s.score,
    maxScore: s.maxScore,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt,
    teacherFeedback: s.teacherFeedback,
  }));
}

export async function getSubmissionDetail(teacherId: string, submissionId: string) {
  const submission = await prisma.activitySubmission.findUnique({
    where: { id: submissionId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      activity: {
        select: {
          id: true,
          title: true,
          type: true,
          contentId: true,
          sectionId: true,
        },
      },
    },
  });

  if (!submission) throw new AppError("Submission was not found.", 404, "SUBMISSION_NOT_FOUND");

  const activity = submission.activity;
  const section = await prisma.classSection.findUnique({
    where: { id: activity.sectionId },
    select: { teacherId: true },
  });

  if (!section || section.teacherId !== teacherId)
    throw new AppError("You cannot view another teacher's submission.", 403, "SUBMISSION_FORBIDDEN");

  return submission;
}

export async function gradeSubmission(
  teacherId: string,
  submissionId: string,
  input: {
    score: number;
    maxScore?: number | null;
    teacherFeedback?: string | null;
    status?: string;
  },
) {
  const submission = await getSubmissionDetail(teacherId, submissionId);

  const updated = await prisma.activitySubmission.update({
    where: { id: submissionId },
    data: {
      score: input.score,
      ...(input.maxScore !== undefined ? { maxScore: input.maxScore } : {}),
      ...(input.teacherFeedback !== undefined ? { teacherFeedback: input.teacherFeedback } : {}),
      ...(input.status !== undefined ? { status: input.status as any } : { status: "GRADED" }),
      gradedAt: new Date(),
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  return updated;
}
