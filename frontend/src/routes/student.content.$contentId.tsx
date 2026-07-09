import { createFileRoute } from "@tanstack/react-router";
import { StudentContentPage } from "@/features/student/pages/StudentContentPage";

export const Route = createFileRoute("/student/content/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { contentId } = Route.useParams();
  return <StudentContentPage contentId={contentId} />;
}
