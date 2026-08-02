import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import {
  availabilityWindowWhere,
  isWithinAttemptTimeLimit,
  isWithinAvailabilityWindow,
} from "./content.visibility";

async function upsertActivitySubmission(
  studentId: string,
  sectionId: string,
  contentId: string,
  status: "IN_PROGRESS" | "SUBMITTED" | "COMPLETED",
  score?: number | null,
  maxScore?: number | null,
) {
  const activity = await prisma.activity.findFirst({
    where: { contentId, sectionId },
    select: { id: true },
  });

  if (!activity) return;

  await prisma.activitySubmission.upsert({
    where: { activityId_studentId: { activityId: activity.id, studentId } },
    create: {
      activityId: activity.id,
      studentId,
      sectionId,
      status: status as any,
      score: score ?? null,
      maxScore: maxScore ?? null,
      startedAt: status === "IN_PROGRESS" ? new Date() : null,
      submittedAt: status === "SUBMITTED" || status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status: status as any,
      score: score ?? undefined,
      maxScore: maxScore ?? undefined,
      startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
      submittedAt: status === "SUBMITTED" || status === "COMPLETED" ? new Date() : undefined,
    },
  });
}

export async function getStudentContent(studentId: string, sectionId: string, type?: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  const where: Record<string, unknown> = {
    sectionId,
    isPublished: true,
    AND: availabilityWindowWhere(),
  };
  if (type) where.type = type;

  const content = await prisma.classContent.findMany({
    where,
    include: {
      _count: { select: { questions: true } },
      activity: {
        select: {
          id: true,
          type: true,
          dueDate: true,
          availableFrom: true,
          availableTo: true,
          submissions: {
            where: { studentId },
            select: { status: true, score: true, maxScore: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return content;
}

export async function getStudentContentDetail(studentId: string, contentId: string) {
  const content = await prisma.classContent.findUnique({
    where: { id: contentId, isPublished: true },
    include: {
      questions: {
        select: {
          id: true,
          equation: true,
          choices: true,
          explanation: true,
          points: true,
          difficulty: true,
          imageUrl: true,
        },
        orderBy: { id: "asc" },
      },
      section: { select: { id: true, name: true } },
      activity: {
        select: {
          id: true,
          title: true,
          type: true,
          dueDate: true,
          availableFrom: true,
          availableTo: true,
          totalPoints: true,
          submissions: {
            where: { studentId },
            select: { status: true, score: true, maxScore: true },
          },
        },
      },
      attempts: {
        where: { studentId },
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          id: true,
          startedAt: true,
          completedAt: true,
          score: true,
          maxScore: true,
          status: true,
          answers: {
            select: { id: true, selectedAnswer: true, isCorrect: true, questionId: true },
          },
        },
      },
    },
  });

  if (!content) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");

  if (!isWithinAvailabilityWindow(content)) {
    throw new AppError("Content is not currently available.", 404, "CONTENT_NOT_AVAILABLE");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId: content.sectionId } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  return content;
}

export async function startContentAttempt(studentId: string, contentId: string) {
  const content = await prisma.classContent.findUnique({
    where: { id: contentId, isPublished: true },
    select: {
      id: true,
      sectionId: true,
      type: true,
      timeLimitMinutes: true,
      attemptsAllowed: true,
      availableFrom: true,
      availableTo: true,
    },
  });

  if (!content) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");

  if (!isWithinAvailabilityWindow(content)) {
    throw new AppError("Content is not currently available.", 404, "CONTENT_NOT_AVAILABLE");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId: content.sectionId } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  const existingActive = await prisma.contentAttempt.findFirst({
    where: { studentId, contentId, status: "ACTIVE" },
  });

  if (existingActive) {
    if (!isWithinAttemptTimeLimit(existingActive.startedAt, content.timeLimitMinutes)) {
      throw new AppError("This attempt has expired.", 403, "ATTEMPT_EXPIRED");
    }
    return existingActive;
  }

  const attemptCount = await prisma.contentAttempt.count({ where: { studentId, contentId } });
  if (attemptCount >= content.attemptsAllowed) {
    throw new AppError("You have used all allowed attempts.", 403, "ATTEMPT_LIMIT_REACHED");
  }

  const attempt = await prisma.contentAttempt.create({
    data: {
      contentId,
      studentId,
      sectionId: content.sectionId,
      status: "ACTIVE",
    },
  });

  await upsertActivitySubmission(studentId, content.sectionId, contentId, "IN_PROGRESS");

  return attempt;
}

export async function answerContentQuestion(
  studentId: string,
  contentId: string,
  questionId: string,
  selectedAnswer: string,
) {
  const question = await prisma.contentQuestion.findUnique({
    where: { id: questionId, contentId },
    select: {
      id: true,
      correctAnswer: true,
      explanation: true,
      points: true,
      content: {
        select: { sectionId: true, availableFrom: true, availableTo: true, timeLimitMinutes: true },
      },
    },
  });

  if (!question) throw new AppError("Question was not found.", 404, "QUESTION_NOT_FOUND");

  const attempt = await prisma.contentAttempt.findFirst({
    where: { studentId, contentId, status: "ACTIVE" },
  });

  if (!attempt) throw new AppError("No active attempt. Start the content first.", 400, "NO_ACTIVE_ATTEMPT");

  if (!isWithinAvailabilityWindow(question.content)) {
    throw new AppError("Content is not currently available.", 403, "CONTENT_NOT_AVAILABLE");
  }
  if (!isWithinAttemptTimeLimit(attempt.startedAt, question.content.timeLimitMinutes)) {
    throw new AppError("This attempt has expired.", 403, "ATTEMPT_EXPIRED");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId: question.content.sectionId } },
    select: { status: true },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  const existingAnswer = await prisma.contentAnswer.findFirst({
    where: { attemptId: attempt.id, questionId },
  });

  if (existingAnswer) {
    throw new AppError("Question already answered.", 400, "ALREADY_ANSWERED");
  }

  const isCorrect = selectedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

  const answer = await prisma.contentAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId,
      selectedAnswer,
      isCorrect,
    },
  });

  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    points: isCorrect ? question.points : 0,
    answer,
  };
}

export async function submitContentAttempt(studentId: string, contentId: string) {
  const attempt = await prisma.contentAttempt.findFirst({
    where: { studentId, contentId, status: "ACTIVE" },
    include: {
      answers: true,
      content: {
        select: {
          passingScore: true,
          availableFrom: true,
          availableTo: true,
          timeLimitMinutes: true,
          questions: { select: { id: true, points: true } },
        },
      },
    },
  });

  if (!attempt) throw new AppError("No active attempt.", 400, "NO_ACTIVE_ATTEMPT");

  if (!isWithinAvailabilityWindow(attempt.content)) {
    throw new AppError("Content is not currently available.", 403, "CONTENT_NOT_AVAILABLE");
  }
  if (!isWithinAttemptTimeLimit(attempt.startedAt, attempt.content.timeLimitMinutes)) {
    throw new AppError("This attempt has expired.", 403, "ATTEMPT_EXPIRED");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId: attempt.sectionId } },
    select: { status: true },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  const answeredCount = attempt.answers.length;
  const totalQuestions = attempt.content.questions.length;
  const pointsByQuestionId = new Map(
    attempt.content.questions.map((question) => [question.id, question.points]),
  );
  const score = attempt.answers.reduce(
    (sum, answer) => sum + (answer.isCorrect ? (pointsByQuestionId.get(answer.questionId) ?? 0) : 0),
    0,
  );
  const maxScore = attempt.content.questions.reduce((sum, q) => sum + q.points, 0);
  const passingScore = attempt.content.passingScore ?? 70;
  const passed = maxScore === 0 ? true : Math.round((score / maxScore) * 100) >= passingScore;

  const updated = await prisma.contentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      score,
      maxScore,
    },
  });

  await upsertActivitySubmission(studentId, attempt.sectionId, contentId, "COMPLETED", score, maxScore);

  return {
    score,
    totalScore: maxScore,
    passed,
  };
}

export async function getStudentContentAttempts(studentId: string, contentId: string) {
  const attempts = await prisma.contentAttempt.findMany({
    where: { studentId, contentId },
    include: {
      answers: {
        include: { question: { select: { equation: true, points: true } } },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return attempts;
}
