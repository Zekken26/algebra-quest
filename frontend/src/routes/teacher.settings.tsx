import { createFileRoute } from "@tanstack/react-router";
import { TeacherSettingsPage } from "@/features/teacher/pages/TeacherSettingsPage";

export const Route = createFileRoute("/teacher/settings")({
  component: TeacherSettingsPage,
});
