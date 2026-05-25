import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardPage } from "@/features/teacher/pages/LeaderboardPage";

export const Route = createFileRoute("/teacher/leaderboard")({
  component: LeaderboardPage,
});
