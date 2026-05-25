import { createFileRoute } from "@tanstack/react-router";
import { JoinClassPage } from "@/features/student/pages/JoinClassPage";

export const Route = createFileRoute("/student/join-class")({
  component: JoinClassPage,
});
