import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export async function getStudentContent(studentId: string, sectionId: string, type?: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "NOT_ENROLLED");
  }

  const where: Record<string, unknown> = { sectionId, isPublished: true };
  if (type) where.type = type;

  const content = await prisma.classContent.findMany({
    where,
    include: {
      _count: { select: { questions: true } },
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
          points: true,
          difficulty: true,
          imageUrl: true,
        },
        orderBy: { id: "asc" },
      },
      section: { select: { id: true, name: true } },
    },
  });

  if (!content) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");

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
    select: { id: true, sectionId: true, type: true, timeLimitMinutes: true },
  });

  if (!content) throw new AppError("Content was not found.", 404, "CONTENT_NOT_FOUND");

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
    return existingActive;
  }

  const attempt = await prisma.contentAttempt.create({
    data: {
      contentId,
      studentId,
      sectionId: content.sectionId,
      status: "ACTIVE",
    },
  });

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
    select: { id: true, correctAnswer: true, points: true, content: { select: { sectionId: true } } },
  });

  if (!question) throw new AppError("Question was not found.", 404, "QUESTION_NOT_FOUND");

  const attempt = await prisma.contentAttempt.findFirst({
    where: { studentId, contentId, status: "ACTIVE" },
  });

  if (!attempt) throw new AppError("No active attempt. Start the content first.", 400, "NO_ACTIVE_ATTEMPT");

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

  return { isCorrect, points: isCorrect ? question.points : 0, answer };
}

export async function submitContentAttempt(studentId: string, contentId: string) {
  const attempt = await prisma.contentAttempt.findFirst({
    where: { studentId, contentId, status: "ACTIVE" },
    include: {
      answers: true,
      content: { include: { questions: { select: { id: true, points: true } } } },
    },
  });

  if (!attempt) throw new AppError("No active attempt.", 400, "NO_ACTIVE_ATTEMPT");

  const answeredCount = attempt.answers.length;
  const totalQuestions = attempt.content.questions.length;
  const score = attempt.answers.filter((a) => a.isCorrect).reduce((sum) => sum + 1, 0);
  const maxScore = attempt.content.questions.reduce((sum, q) => sum + q.points, 0);

  const updated = await prisma.contentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      score,
      maxScore,
    },
  });

  const allAnswers = await prisma.contentAnswer.findMany({
    where: { attemptId: attempt.id },
    select: {
      id: true,
      questionId: true,
      selectedAnswer: true,
      isCorrect: true,
      answeredAt: true,
    },
  });

  const questions = await prisma.contentQuestion.findMany({
    where: { contentId },
    select: { id: true, equation: true, choices: true, correctAnswer: true, explanation: true, points: true },
  });

  return {
    attempt: updated,
    result: {
      score,
      maxScore,
      percentage: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100),
      answeredCount,
      totalQuestions,
    },
    answers: allAnswers,
    questions,
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
