import { Lock, Puzzle } from "lucide-react";
import type { StudentModule } from "@/features/student/types/student.types";

type LockedQuestCardProps = {
  module: StudentModule;
};

export function LockedQuestCard({ module }: LockedQuestCardProps) {
  return (
    <article className="quest-panel overflow-hidden opacity-55">
      <div className="h-2 bg-stone-foreground/20" />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-stone-foreground/50">
              {module.rank}
            </p>
            <h3 className="mt-1 font-display text-2xl text-primary">{module.title}</h3>
            <p className="text-sm text-stone-foreground/65">{module.topic}</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-stone-foreground/20 bg-black/20">
            <Lock className="h-5 w-5" />
          </div>
        </div>
        <p className="text-sm leading-6 text-stone-foreground/65">{module.description}</p>
        <div className="mt-5 rounded-2xl border border-stone-foreground/15 bg-black/20 p-4 text-sm text-stone-foreground/70">
          <Puzzle className="mb-2 h-5 w-5 text-primary" />
          Unlock this gate by completing the previous quest level.
        </div>
      </div>
    </article>
  );
}
