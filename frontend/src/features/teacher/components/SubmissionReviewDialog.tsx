import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ClassContentItem } from "@/features/teacher/types/teacher.types";

type Submission = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  score: number | null;
  maxScore: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  teacherFeedback: string | null;
};

type SubmissionReviewDialogProps = {
  contentItem: ClassContentItem;
  classId: string;
  onClose: () => void;
};

export function SubmissionReviewDialog({ contentItem, classId, onClose }: SubmissionReviewDialogProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const { getAuth } = await import("@/lib/store");
        const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
        const auth = getAuth();
        const res = await fetch(`${API_BASE_URL}/teacher/content/${contentItem.id}/submissions`, {
          headers: {
            "Content-Type": "application/json",
            ...(auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.data?.submissions) {
          setSubmissions(data.data.submissions);
        } else {
          setSubmissions([]);
        }
      } catch {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchSubmissions();
  }, [contentItem.id]);

  const gradeSubmission = async (submission: Submission) => {
    const score = Number(gradeInput);
    if (!Number.isFinite(score) || score < 0) {
      toast.error("Enter a valid score.");
      return;
    }
    setSaving(true);
    try {
      const { getAuth } = await import("@/lib/store");
      const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
      const auth = getAuth();
      const res = await fetch(`${API_BASE_URL}/teacher/submissions/${submission.id}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          score,
          maxScore: contentItem.maxScore ?? submission.maxScore ?? 100,
          teacherFeedback: feedbackInput.trim() || null,
          status: "GRADED",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message ?? "Failed to grade.");
      toast.success("Submission graded.");
      setSelectedSubmission(null);
      setGradeInput("");
      setFeedbackInput("");
      const { getAuth: getAuth2 } = await import("@/lib/store");
      const auth2 = getAuth2();
      const res2 = await fetch(`${API_BASE_URL}/teacher/content/${contentItem.id}/submissions`, {
        headers: {
          "Content-Type": "application/json",
          ...(auth2?.accessToken ? { Authorization: `Bearer ${auth2.accessToken}` } : {}),
        },
        credentials: "include",
      });
      const data2 = await res2.json();
      if (data2.success && data2.data?.submissions) setSubmissions(data2.data.submissions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to grade.");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: typeof Clock }> = {
      NOT_STARTED: { label: "Not Started", color: "text-stone-400 bg-stone-500/10", icon: Clock },
      IN_PROGRESS: { label: "In Progress", color: "text-accent bg-accent/10", icon: Clock },
      SUBMITTED: { label: "Submitted", color: "text-blue-400 bg-blue-500/10", icon: Clock },
      COMPLETED: { label: "Completed", color: "text-success bg-success/10", icon: CheckCircle2 },
      GRADED: { label: "Graded", color: "text-primary bg-primary/10", icon: CheckCircle2 },
    };
    const c = config[status] ?? config.NOT_STARTED;
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 px-4 py-8">
      <section className="teacher-card w-full max-w-4xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-primary">Submissions: {contentItem.title}</h2>
            <p className="text-sm text-stone-foreground/70">{submissions.length} submissions</p>
          </div>
          <button type="button" className="btn-game btn-stone text-sm" onClick={onClose}>Close</button>
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-stone-foreground/60">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-foreground/60">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 text-xs uppercase tracking-wide text-stone-foreground/60">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-t border-primary/10">
                    <td className="p-3 font-medium">{sub.studentName}</td>
                    <td className="p-3 text-stone-foreground/70">{sub.studentEmail}</td>
                    <td className="p-3">{statusBadge(sub.status)}</td>
                    <td className="p-3">
                      {sub.score !== null ? `${sub.score}/${sub.maxScore ?? "?"}` : "--"}
                    </td>
                    <td className="p-3 text-stone-foreground/70">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "--"}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        className="btn-game btn-stone text-xs"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setGradeInput(sub.score !== null ? String(sub.score) : "");
                          setFeedbackInput(sub.teacherFeedback ?? "");
                        }}
                      >
                        {sub.status === "GRADED" ? "Regrade" : "Grade"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedSubmission ? (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 px-4">
            <section className="teacher-card w-full max-w-md p-5">
              <h3 className="font-display text-lg text-primary">Grade: {selectedSubmission.studentName}</h3>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs text-stone-foreground/60">Score</span>
                  <input
                    className="teacher-input"
                    type="number"
                    min="0"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-stone-foreground/60">Feedback (optional)</span>
                  <textarea
                    className="teacher-input min-h-24"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" className="btn-game btn-stone text-sm" onClick={() => setSelectedSubmission(null)}>Cancel</button>
                <button type="button" className="btn-game text-sm" onClick={() => void gradeSubmission(selectedSubmission)} disabled={saving}>
                  {saving ? "Saving..." : "Save Grade"}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}
