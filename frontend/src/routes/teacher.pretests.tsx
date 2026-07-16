import { createFileRoute } from "@tanstack/react-router";
import { CreatePreTestPage } from "@/features/teacher/pages/CreatePreTestPage";

export const Route = createFileRoute("/teacher/pretests")({
  component: CreatePreTestPage,
});
