import { createFileRoute } from "@tanstack/react-router";
import { ForestBackground } from "@/components/ForestBackground";
import { LandingNavbar } from "@/components/LandingNavbar";
import { AboutPage } from "@/features/about/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Algebra Quest" },
      {
        name: "description",
        content:
          "Learn about Algebra Quest and the pre-service Mathematics teachers who developed it.",
      },
    ],
  }),
  component: AboutRoute,
});

function AboutRoute() {
  return (
    <ForestBackground>
      <LandingNavbar />
      <AboutPage />
    </ForestBackground>
  );
}
