import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpenText, Lock, Play, ShieldCheck } from "lucide-react";
import type { StudentModule, StudentProgress } from "@/features/student/types/student.types";

type ModuleCardProps = {
  module: StudentModule;
  progress: StudentProgress["modules"][string];
};

export function ModuleCard({ module, progress }: ModuleCardProps) {
  const isLocked = progress.status === "locked";
  const isComplete = progress.status === "completed";

  return (
    <motion.article
      whileHover={!isLocked ? { y: -6, scale: 1.01 } : undefined}
      className={`quest-panel overflow-hidden ${isLocked ? "opacity-60" : ""}`}
    >
      <div className="h-2 bg-[var(--gradient-gold)]" />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
              {module.rank}
            </p>
            <h3 className="mt-1 font-display text-2xl text-primary">{module.title}</h3>
            <p className="text-sm text-stone-foreground/75">{module.topic}</p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-black/20">
            {isLocked ? (
              <Lock className="h-5 w-5" />
            ) : isComplete ? (
              <ShieldCheck className="h-5 w-5 text-success" />
            ) : (
              <BookOpenText className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>

        <p className="min-h-12 text-sm leading-6 text-stone-foreground/80">{module.description}</p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs uppercase tracking-wide text-stone-foreground/70">
            <span>Completion</span>
            <span>{progress.completion}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-primary/25 bg-black/25">
            <div
              className="h-full bg-[var(--gradient-gold)]"
              style={{ width: `${progress.completion}%` }}
            />
          </div>
        </div>

        <Link
          to="/student/modules/$moduleId/lesson"
          params={{ moduleId: module.id }}
          disabled={isLocked}
          className={`btn-game mt-5 w-full text-sm ${isLocked ? "pointer-events-none" : ""}`}
        >
          <Play className="h-4 w-4" />
          {progress.completion > 0 ? "Continue" : "Start"}
        </Link>
      </div>
    </motion.article>
  );
}
