import { createFileRoute } from "@tanstack/react-router";
import { ClassDetailsPage } from "@/features/teacher/pages/ClassDetailsPage";

export const Route = createFileRoute("/teacher/classes_/$classId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { classId } = Route.useParams();
  return <ClassDetailsPage classId={classId} />;
}
