import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/features/teacher/pages/AnalyticsPage";

export const Route = createFileRoute("/teacher/analytics")({
  component: AnalyticsPage,
});
