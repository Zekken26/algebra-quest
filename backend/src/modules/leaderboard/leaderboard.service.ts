import { prisma } from "../../config/prisma";
import { calculateLeaderboardScore } from "../../utils/calculateLeaderboardScore";
import { assertTeacherOwnsClass } from "../classes/class.service";

export async function getClassLeaderboard(teacherId: string, classId: string) {
  await assertTeacherOwnsClass(teacherId, classId);

  const section = await prisma.classSection.findUnique({
    where: { id: classId },
    include: {
      studentSections: {
        where: { status: "ACTIVE" },
        select: { student: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { student: { name: "asc" } },
      },
      quests: { select: { id: true, requiredPuzzlePieces: true } },
    },
  });

  const students = section?.studentSections.map((enrollment) => enrollment.student) ?? [];
  const questIds = section?.quests.map((quest) => quest.id) ?? [];
  const totalQuests = questIds.length;
  const maxScore = section?.quests.reduce((sum, quest) => sum + quest.requiredPuzzlePieces * 10, 0) ?? 0;

  const rows = await Promise.all(
    students.map(async (student) => {
      const progress = await prisma.studentProgress.findMany({
        where: { studentId: student.id, sectionId: classId, questId: { in: questIds } },
      });

      const totalScore = progress.reduce((sum, item) => sum + item.score, 0);
      const completedQuests = progress.filter((item) => item.questCompleted).length;
      const totalTimeSpent = progress.reduce((sum, item) => sum + item.timeSpent, 0);
      const totalCorrect = progress.reduce((sum, item) => sum + item.correctAnswers, 0);
      const totalWrong = progress.reduce((sum, item) => sum + item.wrongAnswers, 0);
      const totalAnswers = totalCorrect + totalWrong;
      const accuracy = totalAnswers === 0 ? 0 : Number(((totalCorrect / totalAnswers) * 100).toFixed(2));
      const overallScore = calculateLeaderboardScore({
        score: totalScore,
        maxScore,
        completedQuests,
        totalQuests,
        accuracy,
      });

      return {
        student,
        totalScore,
        completedQuests,
        totalQuests,
        accuracy,
        totalTimeSpent,
        overallScore,
      };
    }),
  );

  return rows
    .sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.completedQuests !== a.completedQuests) return b.completedQuests - a.completedQuests;
      return a.totalTimeSpent - b.totalTimeSpent;
    })
    .map((row, index) => ({ rank: index + 1, ...row }));
}

export async function getTopStudent(teacherId: string, classId: string) {
  const leaderboard = await getClassLeaderboard(teacherId, classId);
  return leaderboard[0] ?? null;
}
