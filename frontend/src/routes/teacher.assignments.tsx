import { createFileRoute } from "@tanstack/react-router";
import { CreateAssignmentPage } from "@/features/teacher/pages/CreateAssignmentPage";

export const Route = createFileRoute("/teacher/assignments")({
  component: CreateAssignmentPage,
});
