import { createFileRoute } from "@tanstack/react-router";
import { ModuleQuizPage } from "@/features/student/pages/ModuleQuizPage";

export const Route = createFileRoute("/student/modules/$moduleId/quiz")({
  component: RouteComponent,
});

function RouteComponent() {
  const { moduleId } = Route.useParams();
  return <ModuleQuizPage moduleId={moduleId} />;
}
