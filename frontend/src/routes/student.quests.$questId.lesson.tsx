import { createFileRoute } from "@tanstack/react-router";
import { AssignedQuestGuidePage } from "@/features/student/pages/AssignedQuestGuidePage";

export const Route = createFileRoute("/student/quests/$questId/lesson")({
  component: RouteComponent,
});

function RouteComponent() {
  const { questId } = Route.useParams();
  return <AssignedQuestGuidePage questId={questId} />;
}
