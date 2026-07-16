import { Download, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchTeacherClassDetails,
  updateStudentGrade,
  type TeacherClassDetails,
} from "@/features/teacher/services/teacherService";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

type GradesTabProps = {
  classId: string;
};

export function GradesTab({ classId }: GradesTabProps) {
  const [details, setDetails] = useState<TeacherClassDetails | null>(null);
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchTeacherClassDetails(classId);
      setDetails(d);
      setGradeDrafts(
        Object.fromEntries(
          d.students.map((s) => [s.id, s.grade === null || s.grade === undefined ? "" : String(s.grade)]),
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load grades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [classId]);

  const students = useMemo(
    () =>
      details?.students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        avatar: initials(s.name),
        grade: s.grade,
        accuracy: Math.round(s.progressSummary?.accuracy ?? 0),
        completion: Math.round(s.progressSummary?.completionProgress ?? 0),
        xp: s.xp ?? s.progressSummary?.xpEarned ?? 0,
      })) ?? [],
    [details],
  );

  const saveGrade = async (studentId: string, studentName: string) => {
    const rawGrade = gradeDrafts[studentId]?.trim() ?? "";
    const grade = rawGrade === "" ? null : Number(rawGrade);
    if (grade !== null && (!Number.isFinite(grade) || grade < 0 || grade > 100)) {
      toast.error("Grade must be between 0 and 100.");
      return;
    }
    setSavingGradeId(studentId);
    try {
      await updateStudentGrade(classId, studentId, grade);
      toast.success(grade === null ? "Grade cleared." : `${studentName}'s grade saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save grade.");
    } finally {
      setSavingGradeId(null);
    }
  };

  const exportCsv = () => {
    if (students.length === 0) { toast.error("No students to export."); return; }
    const headers = ["Name", "Email", "Grade", "Accuracy (%)", "Completion (%)", "XP"];
    const rows = students.map((s) =>
      [`"${s.name.replace(/"/g, '""')}"`, s.email ?? "", s.grade ?? "", s.accuracy, s.completion, s.xp].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades-${details?.classInfo.name ?? "class"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Grades exported.");
  };

  if (loading) {
    return <p className="py-4 text-center text-sm text-stone-foreground/60">Loading grades...</p>;
  }

  return (
    <div>
      <section className="teacher-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">Grades</h2>
            <p className="text-sm text-stone-foreground/70">{students.length} students</p>
          </div>
          <button type="button" className="btn-game text-sm" onClick={exportCsv} disabled={students.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-xs uppercase tracking-wide text-stone-foreground/60">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4">Completion</th>
                <th className="p-4">XP</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-primary/10">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 font-bold text-primary text-xs">
                        {student.avatar}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td className="p-4 text-stone-foreground/70">{student.email}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="teacher-input h-10 w-20 px-3 py-2"
                      placeholder="--"
                      value={gradeDrafts[student.id] ?? ""}
                      onChange={(e) => setGradeDrafts((d) => ({ ...d, [student.id]: e.target.value }))}
                    />
                  </td>
                  <td className="p-4">{student.accuracy}%</td>
                  <td className="p-4">{student.completion}%</td>
                  <td className="p-4">{student.xp}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      className="btn-game btn-stone text-xs"
                      onClick={() => void saveGrade(student.id, student.name)}
                      disabled={savingGradeId === student.id}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingGradeId === student.id ? "Saving" : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
