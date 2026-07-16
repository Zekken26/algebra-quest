import { createFileRoute } from "@tanstack/react-router";
import { CreateAssessmentPage } from "@/features/teacher/pages/CreateAssessmentPage";

export const Route = createFileRoute("/teacher/assessments")({
  component: CreateAssessmentPage,
});
