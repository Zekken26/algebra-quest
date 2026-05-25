import { createFileRoute } from "@tanstack/react-router";
import { ModuleBuilderPage } from "@/features/teacher/pages/ModuleBuilderPage";

export const Route = createFileRoute("/teacher/modules")({
  component: ModuleBuilderPage,
});
