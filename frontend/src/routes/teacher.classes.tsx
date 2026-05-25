import { createFileRoute } from "@tanstack/react-router";
import { ClassManagementPage } from "@/features/teacher/pages/ClassManagementPage";

export const Route = createFileRoute("/teacher/classes")({
  component: ClassManagementPage,
});
