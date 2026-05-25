import { createFileRoute } from "@tanstack/react-router";
import { AlgebraQuestGamePage } from "@/features/student/pages/AlgebraQuestGamePage";

export const Route = createFileRoute("/student/modules/$moduleId/game")({
  component: RouteComponent,
});

function RouteComponent() {
  const { moduleId } = Route.useParams();
  return <AlgebraQuestGamePage moduleId={moduleId} />;
}
