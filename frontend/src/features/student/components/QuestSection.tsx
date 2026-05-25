import type { StudentModule, StudentProgress } from "@/features/student/types/student.types";
import { LockedQuestCard } from "@/features/student/components/LockedQuestCard";
import { QuestCard } from "@/features/student/components/QuestCard";

type QuestSectionProps = {
  modules: StudentModule[];
  progress: StudentProgress;
};

export function QuestSection({ modules, progress }: QuestSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
            Puzzle gates
          </p>
          <h2 className="font-display text-3xl text-primary">Choose Your Quest</h2>
        </div>
        <p className="text-sm text-stone-foreground/70">
          Collect puzzle pieces to unlock each next level.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) =>
          progress.modules[module.id].status === "locked" ? (
            <LockedQuestCard key={module.id} module={module} />
          ) : (
            <QuestCard key={module.id} module={module} progress={progress.modules[module.id]} />
          ),
        )}
      </div>
    </section>
  );
}
