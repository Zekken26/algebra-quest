import { createFileRoute } from "@tanstack/react-router";
import { StudentProgressPage } from "@/features/student/pages/StudentProgressPage";

export const Route = createFileRoute("/student/progress")({
  component: StudentProgressPage,
});
