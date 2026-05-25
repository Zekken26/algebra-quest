import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Home, RotateCcw } from "lucide-react";

type LevelCompleteModalProps = {
  open: boolean;
  title: string;
  score: number;
  xp: number;
  coins: number;
  badge: string;
  guideModuleId?: string;
  onRetry?: () => void;
};

export function LevelCompleteModal({
  open,
  title,
  score,
  xp,
  coins,
  badge,
  guideModuleId,
  onRetry,
}: LevelCompleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.86, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="quest-panel w-full max-w-xl p-6 text-center"
      >
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-[var(--gradient-gold)] shadow-[var(--shadow-glow-gold)]">
          <Award className="h-10 w-10 text-gold-foreground" />
        </div>
        <h2 className="font-display text-3xl text-primary">{title}</h2>
        <p className="mt-2 text-stone-foreground/75">Badge earned: {badge}</p>
        <div className="my-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-primary/20 bg-black/20 p-3">
            <p className="font-display text-2xl text-primary">{score}</p>
            <p className="text-xs">score</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-black/20 p-3">
            <p className="font-display text-2xl text-primary">{xp}</p>
            <p className="text-xs">XP</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-black/20 p-3">
            <p className="font-display text-2xl text-primary">{coins}</p>
            <p className="text-xs">coins</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <button onClick={onRetry} className="btn-game">
              <RotateCcw className="h-4 w-4" /> Retry Level
            </button>
          ) : null}
          {guideModuleId ? (
            <Link
              to="/student/modules/$moduleId/lesson"
              params={{ moduleId: guideModuleId }}
              className="btn-game btn-stone"
            >
              Review Guide
            </Link>
          ) : null}
          <Link to="/student" className="btn-game btn-stone">
            <Home className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
