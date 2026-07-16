import { createFileRoute } from "@tanstack/react-router";
import { PreTestWizardPage } from "@/features/teacher/pages/PreTestWizardPage";

export const Route = createFileRoute("/teacher/pretests_/create")({
  component: PreTestWizardPage,
});
