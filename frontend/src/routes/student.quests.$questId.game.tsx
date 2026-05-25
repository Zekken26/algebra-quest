import { createFileRoute } from "@tanstack/react-router";
import { AssignedQuestGamePage } from "@/features/student/pages/AssignedQuestGamePage";

export const Route = createFileRoute("/student/quests/$questId/game")({
  component: RouteComponent,
});

function RouteComponent() {
  const { questId } = Route.useParams();
  return <AssignedQuestGamePage questId={questId} />;
}
