import { Link } from "@tanstack/react-router";
import { BookOpenText } from "lucide-react";
import type { StudentQuestGuide } from "@/features/student/services/studentService";

type StudentGuidesTabProps = {
  guides: StudentQuestGuide[];
};

export function StudentGuidesTab({ guides }: StudentGuidesTabProps) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">Quest Guides</p>
          <h2 className="font-display text-3xl text-primary">Study First</h2>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {guides.length > 0 ? (
          guides.map((guide) => (
            <article key={guide.id} className="quest-panel p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">{guide.topic}</p>
                  <h3 className="mt-1 font-display text-2xl text-primary">{guide.title}</h3>
                </div>
                <BookOpenText className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm leading-6 text-stone-foreground/80">{guide.shortExplanation}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.featuredQuest?.id || guide.quests?.[0]?.id ? (
                  <Link
                    to="/student/quests/$questId/lesson"
                    params={{ questId: guide.featuredQuest?.id ?? guide.quests?.[0]?.id ?? "" }}
                    className="btn-game btn-stone text-sm"
                  >
                    <BookOpenText className="h-4 w-4" /> Open Guide
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <section className="quest-panel p-5 text-sm text-stone-foreground/75">No quest guides yet.</section>
        )}
      </div>
    </section>
  );
}
