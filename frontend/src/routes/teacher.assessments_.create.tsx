import { createFileRoute } from "@tanstack/react-router";
import { AssessmentWizardPage } from "@/features/teacher/pages/AssessmentWizardPage";

export const Route = createFileRoute("/teacher/assessments_/create")({
  component: AssessmentWizardPage,
});
