import { BookOpenText, Gamepad2, ShieldAlert, Trophy } from "lucide-react";
import type { TeacherActivity } from "@/features/teacher/types/teacher.types";

type ActivityFeedProps = {
  activities: TeacherActivity[];
};

const icons = {
  quiz: BookOpenText,
  game: Gamepad2,
  module: Trophy,
  risk: ShieldAlert,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <section className="teacher-card p-5 sm:p-6">
      <h2 className="font-display text-lg text-primary sm:text-xl">Recent Activity</h2>
      <div className="mt-4 space-y-4">
        {activities.map((activity) => {
          const Icon = icons[activity.type];
          return (
            <div key={activity.id} className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-black/25 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm leading-5 text-stone-foreground/70">{activity.detail}</p>
                <p className="mt-1 text-xs text-stone-foreground/50">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
