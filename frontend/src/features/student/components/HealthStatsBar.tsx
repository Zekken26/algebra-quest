import { Coins, Heart, Lightbulb, Star } from "lucide-react";
import type { StudentProgress } from "@/features/student/types/student.types";

type HealthStatsBarProps = {
  progress: StudentProgress;
};

export function HealthStatsBar({ progress }: HealthStatsBarProps) {
  const hearts = Math.max(0, Math.min(progress.hearts ?? 0, 3));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="student-nav-chip" aria-label={`${hearts} hearts remaining`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Heart
            key={index}
            className={`h-4 w-4 ${index < hearts ? "fill-destructive text-destructive" : "text-stone-foreground/30"}`}
          />
        ))}
      </span>
      <span className="student-nav-chip">
        <Star className="h-4 w-4 text-primary" />
        <span>{progress.xp ?? 0} XP</span>
      </span>
      <span className="student-nav-chip">
        <Coins className="h-4 w-4 text-primary" />
        <span>{progress.coins ?? 0}</span>
      </span>
      <span className="student-nav-chip">
        <Lightbulb className="h-4 w-4 text-accent" />
        <span>{progress.hintTokens ?? 0}</span>
      </span>
    </div>
  );
}
