import { createFileRoute } from "@tanstack/react-router";
import { StudentClassPage } from "@/features/student/pages/StudentClassPage";

export const Route = createFileRoute("/student/classes/$classId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { classId } = Route.useParams();
  return <StudentClassPage classId={classId} />;
}
