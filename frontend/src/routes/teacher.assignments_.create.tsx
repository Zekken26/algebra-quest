import { createFileRoute } from "@tanstack/react-router";
import { AssignmentWizardPage } from "@/features/teacher/pages/AssignmentWizardPage";

export const Route = createFileRoute("/teacher/assignments_/create")({
  component: AssignmentWizardPage,
});
