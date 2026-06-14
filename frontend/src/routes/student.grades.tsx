import { createFileRoute } from "@tanstack/react-router";
import { StudentGradesPage } from "../features/student/pages/StudentGradesPage";

export const Route = createFileRoute("/student/grades")({
  component: StudentGradesPage,
});
