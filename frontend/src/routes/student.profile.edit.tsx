import { createFileRoute } from "@tanstack/react-router";
import { EditStudentProfilePage } from "@/features/student/pages/EditStudentProfilePage";

export const Route = createFileRoute("/student/profile/edit")({
  component: EditStudentProfilePage,
});
