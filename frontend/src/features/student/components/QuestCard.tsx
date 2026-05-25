import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play, Puzzle, Trophy } from "lucide-react";
import type { StudentModule, StudentProgress } from "@/features/student/types/student.types";

type QuestCardProps = {
  module: StudentModule;
  progress: StudentProgress["modules"][string];
};

export function QuestCard({ module, progress }: QuestCardProps) {
  const canStart = progress.status !== "locked" && progress.guideViewed;
  const pieces = Math.min(module.requiredPieces, progress.relicPieces ?? 0);

  return (
    <motion.article whileHover={{ y: -6, scale: 1.01 }} className="quest-panel overflow-hidden">
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
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/30 bg-black/20 text-primary">
            {progress.gameCompleted ? (
              <Trophy className="h-6 w-6" />
            ) : (
              <Puzzle className="h-6 w-6" />
            )}
          </div>
        </div>
        <p className="min-h-12 text-sm leading-6 text-stone-foreground/80">{module.description}</p>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs uppercase tracking-wide text-stone-foreground/70">
            <span>Gate Progress</span>
            <span>{progress.completion}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-primary/25 bg-black/25">
            <div
              className="h-full bg-[var(--gradient-gold)]"
              style={{ width: `${progress.completion}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-stone-foreground/70">
            Relic pieces: {pieces}/{module.requiredPieces}
          </p>
        </div>
        <Link
          to="/student/modules/$moduleId/game"
          params={{ moduleId: module.id }}
          className={`btn-game mt-5 w-full text-sm ${!canStart ? "pointer-events-none opacity-55" : ""}`}
        >
          <Play className="h-4 w-4" /> {progress.gameCompleted ? "Replay Quest" : "Start Quest"}
        </Link>
        {!progress.guideViewed ? (
          <p className="mt-3 text-xs text-stone-foreground/60">Review the Quest Guide first.</p>
        ) : null}
      </div>
    </motion.article>
  );
}
