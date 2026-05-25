import { createFileRoute } from "@tanstack/react-router";
import { ModuleLessonPage } from "@/features/student/pages/ModuleLessonPage";

export const Route = createFileRoute("/student/modules/$moduleId/lesson")({
  component: RouteComponent,
});

function RouteComponent() {
  const { moduleId } = Route.useParams();
  return <ModuleLessonPage moduleId={moduleId} />;
}
