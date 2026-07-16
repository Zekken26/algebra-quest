import { Copy, Plus, Save, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  addStudentToSection,
  fetchStudentProgress,
  removeStudentFromSection,
  updateStudentGrade,
  type TeacherClassDetails,
} from "@/features/teacher/services/teacherService";
import type { TeacherStudent } from "@/features/teacher/types/teacher.types";
import { StudentActivityDialog } from "@/features/teacher/components/StudentActivityDialog";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatLastActive(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function toTeacherStudent(
  student: TeacherClassDetails["students"][number],
  classId: string,
): TeacherStudent {
  const accuracy = Math.round(student.progressSummary?.accuracy ?? 0);
  const completion = Math.round(student.progressSummary?.completionProgress ?? 0);
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    classId,
    avatar: initials(student.name),
    xp: student.xp ?? student.progressSummary?.xpEarned ?? 0,
    coins: student.coins ?? student.progressSummary?.coinsEarned ?? 0,
    grade: student.grade ?? null,
    accuracy,
    completion,
    quizAverage: accuracy,
    gameScore: student.progressSummary?.xpEarned ?? 0,
    timeSpentMinutes: Math.round((student.progressSummary?.timeSpent ?? 0) / 60),
    weakAreas: accuracy < 70 ? ["Needs review"] : [],
    currentQuest: student.currentQuest?.title ?? "No active quest",
    status: student.status,
    lastLoginAt: (student as any).lastLoginAt,
    totalAttempts: (student as any).totalAttempts ?? 0,
    correctAttempts: (student as any).correctAttempts ?? 0,
  };
}

type StudentsTabProps = {
  details: TeacherClassDetails | null;
  classId: string;
  onLoad: () => void;
};

export function StudentsTab({ details, classId, onLoad }: StudentsTabProps) {
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<TeacherStudent | null>(null);
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);
  const [activityStudent, setActivityStudent] = useState<TeacherStudent | null>(null);

  const students = useMemo(
    () => details?.students.map((student) => toTeacherStudent(student, classId)) ?? [],
    [details, classId],
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(query) || s.email?.toLowerCase().includes(query),
    );
  }, [students, search]);

  useEffect(() => {
    if (!details) return;
    setGradeDrafts(
      Object.fromEntries(
        details.students.map((student) => [
          student.id,
          student.grade === null || student.grade === undefined ? "" : String(student.grade),
        ]),
      ),
    );
  }, [details]);

  const addStudent = async () => {
    if (!email.trim()) {
      toast.error("Student email is required.");
      return;
    }
    setAdding(true);
    try {
      await addStudentToSection(classId, email.trim());
      setEmail("");
      toast.success("Student added to class.");
      await onLoad();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add student.");
    } finally {
      setAdding(false);
    }
  };

  const removeStudent = async (student: TeacherStudent) => {
    try {
      await removeStudentFromSection(classId, student.id);
      toast.success("Student removed from class.");
      setStudentToRemove(null);
      await onLoad();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove student.");
    }
  };

  const saveGrade = async (student: TeacherStudent) => {
    const rawGrade = gradeDrafts[student.id]?.trim() ?? "";
    const grade = rawGrade === "" ? null : Number(rawGrade);
    if (grade !== null && (!Number.isFinite(grade) || grade < 0 || grade > 100)) {
      toast.error("Grade must be between 0 and 100.");
      return;
    }
    setSavingGradeId(student.id);
    try {
      await updateStudentGrade(classId, student.id, grade);
      toast.success(grade === null ? "Grade cleared." : `${student.name}'s grade saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save grade.");
    } finally {
      setSavingGradeId(null);
    }
  };

  const viewProgress = async (student: TeacherStudent) => {
    try {
      await fetchStudentProgress(student.id);
      toast.success(`${student.name}: ${student.completion}% progress, ${student.accuracy}% accuracy.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load student progress.");
    }
  };

  return (
    <div>
      <section className="teacher-card mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">Student Management</h2>
            <p className="text-sm text-stone-foreground/70">{students.length} students enrolled</p>
          </div>
          <button
            type="button"
            className="btn-game btn-stone text-sm"
            onClick={() => void addStudent()}
            disabled={adding}
          >
            <Plus className="h-4 w-4" /> {adding ? "Adding..." : "Add Student"}
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <input
            className="teacher-input"
            type="email"
            placeholder="Add by student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void addStudent(); }}
          />
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-foreground/45" />
            <input
              className="teacher-input pl-9"
              placeholder="Search students by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="teacher-card mb-6 overflow-hidden">
        <div className="border-b border-primary/10 p-5">
          <h2 className="font-display text-xl text-primary">Student List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-xs uppercase tracking-wide text-stone-foreground/60">
              <tr>
                <th className="p-4">Avatar</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">XP</th>
                <th className="p-4">Coins</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4">Progress %</th>
                <th className="p-4">Attempts</th>
                <th className="p-4">Last Active</th>
                <th className="p-4">Current Quest</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t border-primary/10">
                  <td className="p-4">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 font-bold text-primary">
                      {student.avatar}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{student.name}</td>
                  <td className="p-4 text-stone-foreground/70">{student.email}</td>
                  <td className="p-4">{student.xp}</td>
                  <td className="p-4">{student.coins}</td>
                  <td className="p-4">
                    <div className="flex min-w-36 items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className="teacher-input h-10 w-20 px-3 py-2"
                        aria-label={`Grade for ${student.name}`}
                        placeholder="--"
                        value={gradeDrafts[student.id] ?? ""}
                        onChange={(e) => setGradeDrafts((d) => ({ ...d, [student.id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="btn-game btn-stone text-xs"
                        onClick={() => void saveGrade(student)}
                        disabled={savingGradeId === student.id}
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingGradeId === student.id ? "Saving" : "Save"}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">{student.accuracy}%</td>
                  <td className="p-4">{student.completion}%</td>
                  <td className="p-4">
                    {student.totalAttempts !== undefined ? (
                      <span>
                        {student.totalAttempts}
                        {student.correctAttempts !== undefined ? (
                          <span className="text-stone-foreground/50"> ({student.correctAttempts} correct)</span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-stone-foreground/50">--</span>
                    )}
                  </td>
                  <td className="p-4 text-stone-foreground/70">{formatLastActive(student.lastLoginAt)}</td>
                  <td className="p-4 text-stone-foreground/70">{student.currentQuest}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        student.status === "at-risk"
                          ? "bg-destructive/15 text-destructive"
                          : student.status === "thriving"
                            ? "bg-success/15 text-success"
                            : "bg-primary/15 text-primary"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-game btn-stone text-xs"
                        onClick={() => setActivityStudent(student)}
                      >
                        Activity
                      </button>
                      <button
                        type="button"
                        className="btn-game btn-stone text-xs"
                        onClick={() => void viewProgress(student)}
                      >
                        Progress
                      </button>
                      <button
                        type="button"
                        className="btn-game text-xs"
                        onClick={() => setStudentToRemove(student)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {studentToRemove ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Remove Student</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Remove {studentToRemove.name} from this class? Their historical progress remains available in reports.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-game btn-stone text-sm" onClick={() => setStudentToRemove(null)}>Cancel</button>
              <button type="button" className="btn-game text-sm" onClick={() => void removeStudent(studentToRemove)}>Remove</button>
            </div>
          </section>
        </div>
      ) : null}

      {activityStudent ? (
        <StudentActivityDialog student={activityStudent} open onClose={() => setActivityStudent(null)} />
      ) : null}
    </div>
  );
}
