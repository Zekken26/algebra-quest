import { Coins, Heart, Lightbulb, Star } from "lucide-react";
import type { StudentProgress } from "@/features/student/types/student.types";

type HealthStatsBarProps = {
  progress: StudentProgress;
};

export function HealthStatsBar({ progress }: HealthStatsBarProps) {
  const hearts = Math.max(0, Math.min(progress.hearts ?? 0, 3));

  return (
    <div className="-mx-1 flex min-w-0 items-center gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:p-0">
      <span className="student-nav-chip" aria-label={`${hearts} hearts remaining`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Heart
            key={index}
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${index < hearts ? "fill-destructive text-destructive" : "text-stone-foreground/30"}`}
          />
        ))}
      </span>
      <span className="student-nav-chip">
        <Star className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
        <span>{progress.xp ?? 0} XP</span>
      </span>
      <span className="student-nav-chip">
        <Coins className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
        <span>{progress.coins ?? 0}</span>
      </span>
      <span className="student-nav-chip">
        <Lightbulb className="h-3.5 w-3.5 text-accent sm:h-4 sm:w-4" />
        <span>{progress.hintTokens ?? 0}</span>
      </span>
    </div>
  );
}
