import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Play, Trophy } from "lucide-react";
import type { StudentActivityItem } from "@/features/student/services/studentService";

type StudentAssessmentsTabProps = {
  activities: StudentActivityItem[];
};

export function StudentAssessmentsTab({ activities }: StudentAssessmentsTabProps) {
  const assessments = activities.filter((a) => a.type === "ASSESSMENT");

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">Classwork</p>
          <h2 className="font-display text-3xl text-primary">Assessments</h2>
        </div>
      </div>
      {assessments.length === 0 ? (
        <section className="quest-panel p-5 text-sm text-stone-foreground/75">No assessments assigned yet.</section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assessments.map((activity) => {
            const sub = activity.submissions?.[0];
            const status = sub?.status ?? "NOT_STARTED";
            const score = sub?.score;
            const maxScore = sub?.maxScore;
            const dueDate = activity.dueDate ? new Date(activity.dueDate) : null;
            const isOverdue = dueDate && dueDate < new Date() && status !== "COMPLETED" && status !== "SUBMITTED";
            const statusConfig: Record<string, { label: string; color: string }> = {
              NOT_STARTED: { label: "Not Started", color: "text-stone-400 bg-stone-500/10" },
              IN_PROGRESS: { label: "In Progress", color: "text-accent bg-accent/10" },
              SUBMITTED: { label: "Submitted", color: "text-blue-400 bg-blue-500/10" },
              COMPLETED: { label: "Completed", color: "text-success bg-success/10" },
              OVERDUE: { label: "Overdue", color: "text-destructive bg-destructive/10" },
              GRADED: { label: "Graded", color: "text-primary bg-primary/10" },
            };
            const statusInfo = statusConfig[isOverdue ? "OVERDUE" : status] ?? statusConfig.NOT_STARTED;
            const activityLink = activity.content?.id ? `/student/content/${activity.content.id}` : null;
            if (!activityLink) return null;
            return (
              <Link key={activity.id} to={activityLink} className="quest-panel p-4 transition-colors hover:border-primary/30">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-black/30 p-2"><Trophy className="h-5 w-5 text-primary" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg text-primary truncate">{activity.title}</h3>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-stone-foreground/60">
                      <span>Assessment</span>
                      {activity.content?._count?.questions ? <><span>&bull;</span><span>{activity.content._count.questions} question{activity.content._count.questions !== 1 ? "s" : ""}</span></> : null}
                      {activity.dueDate ? <><span>&bull;</span><span className={isOverdue ? "text-destructive" : ""}>Due {new Date(activity.dueDate).toLocaleDateString()}</span></> : null}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                    {isOverdue ? "Overdue" : statusInfo.label}
                    {score !== null && score !== undefined ? <span className="ml-1">- {score}/{maxScore ?? "?"}</span> : null}
                  </span>
                  {status === "NOT_STARTED" ? <span className="text-xs text-stone-foreground/50"><Play className="mr-1 inline h-3.5 w-3.5" /> Start</span>
                    : status === "IN_PROGRESS" ? <span className="text-xs text-accent"><Clock className="mr-1 inline h-3.5 w-3.5" /> Continue</span>
                    : <span className="text-xs text-success"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> View Results</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
