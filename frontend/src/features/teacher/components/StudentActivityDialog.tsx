import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchStudentActivity } from "@/features/teacher/services/teacherService";
import type { TeacherStudent } from "@/features/teacher/types/teacher.types";

type StudentActivityDialogProps = {
  student: TeacherStudent;
  open: boolean;
  onClose: () => void;
};

type ActivityData = {
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    xp: number;
    coins: number;
    lastLoginAt: string | null;
  };
  recentAttempts: Array<{
    id: string;
    equation: string;
    selectedAnswer: string;
    isCorrect: boolean;
    difficulty: string;
    questTitle: string;
    questTopic: string;
    sectionName: string;
    createdAt: string;
  }>;
  questAttempts: Array<{
    id: string;
    attemptNo: number;
    status: string;
    questTitle: string;
    questTopic: string;
    sectionName: string;
    startedAt: string;
    completedAt: string | null;
  }>;
};

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateTime(dateStr);
}

export function StudentActivityDialog({ student, open, onClose }: StudentActivityDialogProps) {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchStudentActivity(student.id)
      .then((result) => setData(result as ActivityData))
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Unable to load activity."),
      )
      .finally(() => setLoading(false));
  }, [open, student.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-primary/20 bg-[var(--color-background)] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-primary">{student.name}</h2>
            <p className="text-sm text-stone-foreground/70">{student.email}</p>
          </div>
          <button
            type="button"
            className="btn-game btn-stone text-xs"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : data ? (
          <div className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-black/20 p-3 text-center">
                <p className="text-xs uppercase text-stone-foreground/50">XP</p>
                <p className="text-lg font-bold text-primary">{data.student.xp}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-3 text-center">
                <p className="text-xs uppercase text-stone-foreground/50">Coins</p>
                <p className="text-lg font-bold text-primary">{data.student.coins}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-3 text-center">
                <p className="text-xs uppercase text-stone-foreground/50">Last Login</p>
                <p className="text-lg font-bold text-primary">{timeAgo(data.student.lastLoginAt)}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-3 text-center">
                <p className="text-xs uppercase text-stone-foreground/50">Recent Answers</p>
                <p className="text-lg font-bold text-primary">{data.recentAttempts.length}</p>
              </div>
            </div>

            <section>
              <h3 className="mb-3 font-display text-lg text-primary">Recent Answer Attempts</h3>
              <div className="grid gap-2">
                {data.recentAttempts.length === 0 ? (
                  <p className="text-sm text-stone-foreground/50">No attempts yet.</p>
                ) : (
                  data.recentAttempts.slice(0, 20).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center gap-3 rounded-xl border border-primary/10 bg-black/15 p-3"
                    >
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          attempt.isCorrect
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {attempt.isCorrect ? "✓" : "✗"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {attempt.questTitle}
                        </p>
                        <p className="truncate text-xs text-stone-foreground/50">
                          {attempt.equation} · {attempt.sectionName}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-stone-foreground/50">
                        {timeAgo(attempt.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-display text-lg text-primary">Quest Sessions</h3>
              <div className="grid gap-2">
                {data.questAttempts.length === 0 ? (
                  <p className="text-sm text-stone-foreground/50">No quest sessions yet.</p>
                ) : (
                  data.questAttempts.map((qa) => (
                    <div
                      key={qa.id}
                      className="flex items-center gap-3 rounded-xl border border-primary/10 bg-black/15 p-3"
                    >
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          qa.status === "COMPLETED"
                            ? "bg-success/15 text-success"
                            : qa.status === "FAILED"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary"
                        }`}
                      >
                        {qa.attemptNo}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {qa.questTitle}
                        </p>
                        <p className="truncate text-xs text-stone-foreground/50">
                          {qa.sectionName} · Attempt #{qa.attemptNo} ·{" "}
                          {qa.status === "COMPLETED"
                            ? "Completed"
                            : qa.status === "FAILED"
                              ? "Failed"
                              : "Active"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-stone-foreground/50">
                        {formatDateTime(qa.startedAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
