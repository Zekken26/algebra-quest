import { motion } from "framer-motion";
import { Award, Coins, Sparkles, TrendingUp } from "lucide-react";
import type { StudentProgress } from "@/features/student/types/student.types";

type ProgressSummaryCardProps = {
  progress: StudentProgress;
  completedModules: number;
  totalModules: number;
  progressLabel?: string;
};

export function ProgressSummaryCard({
  progress,
  completedModules,
  totalModules,
  progressLabel = "quests completed",
}: ProgressSummaryCardProps) {
  const xpPercent = Math.min(100, (progress.xp % 300) / 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr]"
    >
      <div className="quest-panel p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--gradient-gold)] text-2xl shadow-[var(--shadow-glow-gold)]">
            A
          </div>
          <div>
            <p className="text-sm text-stone-foreground/70">Current rank</p>
            <h2 className="font-display text-2xl text-primary">{progress.rank}</h2>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span>XP toward next rank</span>
            <span className="font-display text-primary">{progress.xp} XP</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-primary/30 bg-black/25">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              className="h-full bg-[var(--gradient-gold)]"
            />
          </div>
        </div>
      </div>

      <div className="quest-panel p-5">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          <span className="font-display">Progress</span>
        </div>
        <p className="text-3xl font-bold">
          {completedModules}/{totalModules}
        </p>
        <p className="text-sm text-stone-foreground/70">{progressLabel}</p>
      </div>

      <div className="quest-panel p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Coins className="mb-2 h-5 w-5 text-primary" />
            <p className="font-display text-2xl text-primary">{progress.coins}</p>
            <p className="text-xs text-stone-foreground/70">coins</p>
          </div>
          <div>
            <Sparkles className="mb-2 h-5 w-5 text-accent" />
            <p className="font-display text-2xl text-primary">{progress.hintTokens}</p>
            <p className="text-xs text-stone-foreground/70">hints</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-black/20 px-3 py-2 text-sm">
          <Award className="h-4 w-4 text-primary" />
          <span>{progress.currentLevel}</span>
        </div>
      </div>
    </motion.section>
  );
}
