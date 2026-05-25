import type { StudentModule, StudentProgress } from "@/features/student/types/student.types";
import { QuestGuideCard } from "@/features/student/components/QuestGuideCard";

type QuestGuideSectionProps = {
  modules: StudentModule[];
  progress: StudentProgress;
};

export function QuestGuideSection({ modules, progress }: QuestGuideSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
            Short learning prep
          </p>
          <h2 className="font-display text-3xl text-primary glow-text">📖 Quest Guide</h2>
        </div>
        <p className="max-w-xl text-sm text-stone-foreground/70">
          Review a quick solving strategy before entering each quest. The quest itself is the
          practice and mastery check.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {modules.map((module) => (
          <QuestGuideCard key={module.id} module={module} progress={progress.modules[module.id]} />
        ))}
      </div>
    </section>
  );
}
