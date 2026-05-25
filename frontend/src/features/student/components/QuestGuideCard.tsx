import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpenText, Play, ScrollText } from "lucide-react";
import type { StudentModule, StudentProgress } from "@/features/student/types/student.types";

type QuestGuideCardProps = {
  module: StudentModule;
  progress: StudentProgress["modules"][string];
};

export function QuestGuideCard({ module, progress }: QuestGuideCardProps) {
  const isUnlocked = progress.status !== "locked";
  const canStart = isUnlocked && progress.guideViewed;
  const pieces = Math.min(module.requiredPieces, progress.relicPieces ?? 0);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={`quest-panel p-5 ${!isUnlocked ? "opacity-60" : ""}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-accent">
            {module.topic}
          </p>
          <h3 className="mt-1 font-display text-2xl text-primary">
            {module.lesson.guideTitle ?? module.lesson.title}
          </h3>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-black/20 text-primary">
          <ScrollText className="h-5 w-5" />
        </div>
      </div>

      <p className="text-sm leading-6 text-stone-foreground/80">{module.lesson.summary}</p>
      <p className="mt-3 text-xs uppercase tracking-wide text-stone-foreground/60">
        Connected quest: {module.title} - relic {pieces}/{module.requiredPieces}
      </p>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-foreground/60">Example</p>
        <p className="mt-1 font-display text-2xl text-primary">{module.lesson.example}</p>
      </div>

      <ol className="mt-4 space-y-2">
        {module.lesson.steps.map((step, index) => (
          <li key={step} className="flex gap-2 text-sm text-stone-foreground/85">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-xs text-primary">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-xl border border-accent/20 bg-accent/10 p-3 text-sm text-stone-foreground/80">
        Tip: {module.lesson.tip}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          to="/student/modules/$moduleId/lesson"
          params={{ moduleId: module.id }}
          className={`btn-game btn-stone text-sm ${!isUnlocked ? "pointer-events-none" : ""}`}
        >
          <BookOpenText className="h-4 w-4" /> Review Guide
        </Link>
        <Link
          to="/student/modules/$moduleId/game"
          params={{ moduleId: module.id }}
          className={`btn-game text-sm ${!canStart ? "pointer-events-none opacity-55" : ""}`}
        >
          <Play className="h-4 w-4" /> Start Quest
        </Link>
      </div>
      {!progress.guideViewed && isUnlocked ? (
        <p className="mt-3 text-xs text-stone-foreground/60">
          Review the guide once to unlock quest start.
        </p>
      ) : null}
    </motion.article>
  );
}
