import type { StudentClassProgress } from "@/features/student/services/studentService";

type StudentProgressTabProps = {
  classProgress: StudentClassProgress | null;
  questsCount: number;
  guidesCount: number;
  activitiesCount: number;
};

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="teacher-card p-4">
      <p className="text-sm text-stone-foreground/65">{label}</p>
      <p className="font-display text-2xl text-primary">{value}</p>
      {subtitle ? <p className="text-xs text-stone-foreground/50 mt-1">{subtitle}</p> : null}
    </div>
  );
}

export function StudentProgressTab({ classProgress, questsCount, guidesCount, activitiesCount }: StudentProgressTabProps) {
  const summary = classProgress?.summary;

  return (
    <section className="mb-8">
      <div className="mb-4">
        <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">Progress</p>
        <h2 className="font-display text-3xl text-primary">Your Performance</h2>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completion" value={`${Math.round(summary?.completionProgress ?? 0)}%`} subtitle="Overall class progress" />
        <StatCard label="Accuracy" value={`${Math.round(summary?.accuracy ?? 0)}%`} subtitle="Average accuracy" />
        <StatCard label="XP Earned" value={String(summary?.xpEarned ?? 0)} subtitle="Total experience points" />
        <StatCard label="Coins Earned" value={String(summary?.coinsEarned ?? 0)} subtitle="Total coins collected" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Quests Completed" value={String(summary?.completedQuests ?? 0)} subtitle={`Out of ${questsCount} total quests`} />
        <StatCard label="Quest Guides" value={String(guidesCount)} subtitle="Available guides" />
        <StatCard label="Activities" value={String(activitiesCount)} subtitle="Assigned activities" />
      </div>

      {summary?.timeSpent ? (
        <div className="teacher-card p-4">
          <p className="text-sm text-stone-foreground/65">Time Spent</p>
          <p className="font-display text-2xl text-primary">
            {Math.round(summary.timeSpent / 3600)}h {Math.round((summary.timeSpent % 3600) / 60)}m
          </p>
        </div>
      ) : null}
    </section>
  );
}
