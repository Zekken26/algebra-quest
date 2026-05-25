import { createFileRoute } from "@tanstack/react-router";
import { CreateQuestPage } from "@/features/teacher/pages/CreateQuestPage";

export const Route = createFileRoute("/teacher/quests/create")({
  component: CreateQuestPage,
});
