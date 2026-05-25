type LeaderboardInput = {
  score: number;
  maxScore: number;
  completedQuests: number;
  totalQuests: number;
  accuracy: number;
};

export function calculateLeaderboardScore(input: LeaderboardInput) {
  const normalizedQuestScore = input.maxScore > 0 ? input.score / input.maxScore : 0;
  const completionProgress = input.totalQuests > 0 ? input.completedQuests / input.totalQuests : 0;
  const accuracyRatio = input.accuracy > 1 ? input.accuracy / 100 : input.accuracy;

  return Number(
    (normalizedQuestScore * 40 + completionProgress * 40 + Math.min(Math.max(accuracyRatio, 0), 1) * 20).toFixed(2),
  );
}
