import { createFileRoute } from "@tanstack/react-router";
import { TeacherProfilePage } from "@/features/teacher/pages/TeacherProfilePage";

export const Route = createFileRoute("/teacher/profile")({
  component: TeacherProfilePage,
});
