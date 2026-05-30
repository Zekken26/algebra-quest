import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpenText,
  Copy,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreateQuestWizard } from "@/features/teacher/components/CreateQuestWizard";
import { LeaderboardTable } from "@/features/teacher/components/LeaderboardTable";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import {
  addStudentToSection,
  createTeacherGuide,
  deleteTeacherSection,
  fetchStudentProgress,
  fetchTeacherClassDetails,
  removeStudentFromSection,
  updateStudentGrade,
  updateTeacherSection,
  type TeacherClassDetails,
  type TeacherSection,
} from "@/features/teacher/services/teacherService";
import type { TeacherStudent } from "@/features/teacher/types/teacher.types";

type ClassDetailsPageProps = {
  classId: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  };
}

export function ClassDetailsPage({ classId }: ClassDetailsPageProps) {
  const navigate = useNavigate();
  const [details, setDetails] = useState<TeacherClassDetails | null>(null);
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<TeacherStudent | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [className, setClassName] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingQuest, setCreatingQuest] = useState(false);
  const [creatingGuide, setCreatingGuide] = useState(false);
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);
  const [guideDraft, setGuideDraft] = useState({
    title: "",
    topic: "",
    shortExplanation: "",
    exampleProblem: "",
    solutionStepsText: "",
    tipsText: "",
  });

  const load = async () => {
    const nextDetails = await fetchTeacherClassDetails(classId);
    setDetails(nextDetails);
    setClassName(nextDetails.classInfo.name);
  };

  useEffect(() => {
    void load().catch((error) =>
      toast.error(error instanceof Error ? error.message : "Unable to load class details."),
    );
  }, [classId]);

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

  const students = useMemo(
    () => details?.students.map((student) => toTeacherStudent(student, classId)) ?? [],
    [details, classId],
  );
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) || student.email?.toLowerCase().includes(query),
    );
  }, [students, search]);
  const topFive = useMemo(
    () =>
      details?.leaderboard.map(
        (row) =>
          ({
            id: row.student.id,
            name: row.student.name,
            email: row.student.email,
            classId,
            avatar: initials(row.student.name),
            xp: row.student.xp ?? row.xpEarned ?? 0,
            coins: row.student.coins ?? row.coinsEarned ?? 0,
            accuracy: Math.round(row.accuracy),
            completion: Math.round(row.completionProgress),
            quizAverage: Math.round(row.accuracy),
            gameScore: Math.round(row.overallScore),
            timeSpentMinutes: Math.round(row.totalTimeSpent / 60),
            weakAreas: [],
            currentQuest: "",
            status: row.accuracy >= 90 ? "thriving" : row.accuracy < 70 ? "at-risk" : "steady",
          }) satisfies TeacherStudent,
      ) ?? [],
    [details, classId],
  );

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
      await load();
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
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove student.");
    }
  };

  const saveClass = async () => {
    if (!className.trim()) {
      toast.error("Class name is required.");
      return;
    }
    setSaving(true);
    try {
      await updateTeacherSection(classId, { name: className.trim() });
      toast.success("Class updated.");
      setEditing(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update class.");
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async () => {
    if (!details) return;
    try {
      await deleteTeacherSection(classId);
      toast.success("Class deleted.");
      navigate({ to: "/teacher/classes" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete class.");
    }
  };

  const viewProgress = async (student: TeacherStudent) => {
    try {
      await fetchStudentProgress(student.id);
      toast.success(
        `${student.name}: ${student.completion}% progress, ${student.accuracy}% accuracy.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load student progress.");
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
      setDetails((current) =>
        current
          ? {
              ...current,
              students: current.students.map((item) =>
                item.id === student.id ? { ...item, grade } : item,
              ),
            }
          : current,
      );
      toast.success(grade === null ? "Grade cleared." : `${student.name}'s grade saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save grade.");
    } finally {
      setSavingGradeId(null);
    }
  };

  const copyClassCode = async () => {
    if (!details?.classInfo.code) return;
    await navigator.clipboard.writeText(details.classInfo.code);
    toast.success("Class code copied.");
  };

  const currentClassSection: TeacherSection | null = details
    ? {
        id: details.classInfo.id,
        name: details.classInfo.name,
        code: details.classInfo.code,
      }
    : null;

  const splitLines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const saveGuide = async () => {
    if (
      !guideDraft.title.trim() ||
      !guideDraft.topic.trim() ||
      !guideDraft.shortExplanation.trim() ||
      !guideDraft.exampleProblem.trim()
    ) {
      toast.error("Complete the guide title, topic, explanation, and example.");
      return;
    }
    const solutionSteps = splitLines(guideDraft.solutionStepsText);
    if (solutionSteps.length === 0) {
      toast.error("Add at least one solution step.");
      return;
    }

    try {
      await createTeacherGuide({
        title: guideDraft.title.trim(),
        topic: guideDraft.topic.trim(),
        shortExplanation: guideDraft.shortExplanation.trim(),
        exampleProblem: guideDraft.exampleProblem.trim(),
        solutionSteps,
        tips: splitLines(guideDraft.tipsText),
        sectionId: classId,
      });
      toast.success("Quest guide created for this class.");
      setCreatingGuide(false);
      setGuideDraft({
        title: "",
        topic: "",
        shortExplanation: "",
        exampleProblem: "",
        solutionStepsText: "",
        tipsText: "",
      });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create guide.");
    }
  };

  return (
    <div>
      <Link to="/teacher/classes" className="btn-game btn-stone mb-4 text-sm">
        <ArrowLeft className="h-4 w-4" /> Classes
      </Link>

      <TeacherHeader
        title={details?.classInfo.name ?? "Class Details"}
        subtitle="Manage students, assigned quests, class analytics, and leaderboard standings."
        actionLabel="Refresh"
        onAction={() => void load()}
      />

      <section className="teacher-card mb-6 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
              Class Header
            </p>
            <h2 className="mt-1 font-display text-3xl text-primary">
              {details?.classInfo.name ?? "Loading..."}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-foreground/75">
              <button
                type="button"
                className="rounded-xl border border-primary/20 bg-black/25 px-3 py-2 text-primary"
                onClick={() => void copyClassCode()}
              >
                Code {details?.classInfo.code ?? "------"} <Copy className="ml-2 inline h-4 w-4" />
              </button>
              <span>Teacher: {details?.classInfo.teacher.name ?? "Loading"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-game btn-stone text-sm"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" /> Edit Class
            </button>
            <button
              type="button"
              className="btn-game text-sm"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete Class
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={String(details?.analytics.totalStudents ?? 0)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Average Accuracy"
          value={`${Math.round(details?.analytics.averageAccuracy ?? 0)}%`}
          icon={<BookOpenText className="h-5 w-5" />}
        />
        <StatCard
          label="Completion Rate"
          value={`${Math.round(details?.analytics.completionRate ?? 0)}%`}
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          label="Students At Risk"
          value={String(details?.analytics.studentsAtRisk ?? 0)}
          icon={<Users className="h-5 w-5" />}
          danger
        />
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="teacher-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-primary">Student Management</h2>
              <p className="text-sm text-stone-foreground/70">
                {students.length} students enrolled
              </p>
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
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void addStudent();
              }}
            />
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-foreground/45" />
              <input
                className="teacher-input pl-9"
                placeholder="Search students by name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="teacher-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-primary">Assigned Content</h2>
              <p className="text-sm text-stone-foreground/70">
                {details?.assignedGuides.length ?? 0} guides - {details?.assignedQuests.length ?? 0}{" "}
                quests
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setCreatingGuide(true)}
              >
                <BookOpenText className="h-4 w-4" /> Create Guide
              </button>
              <button
                type="button"
                className="btn-game text-sm"
                onClick={() => setCreatingQuest(true)}
              >
                <Plus className="h-4 w-4" /> Create Quest
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <ContentList
              title="Quest Guides"
              items={
                details?.assignedGuides.map((guide) => `${guide.title} - ${guide.topic}`) ?? []
              }
            />
            <ContentList
              title="Quests"
              items={
                details?.assignedQuests.map((quest) => `${quest.title} - ${quest.topic}`) ?? []
              }
            />
          </div>
        </section>
      </div>

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
                        onChange={(event) =>
                          setGradeDrafts((current) => ({
                            ...current,
                            [student.id]: event.target.value,
                          }))
                        }
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

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="teacher-card p-5">
          <h2 className="font-display text-xl text-primary">Class Analytics</h2>
          <div className="mt-4 grid gap-3">
            <AnalyticsLine
              label="Average Accuracy"
              value={`${Math.round(details?.analytics.averageAccuracy ?? 0)}%`}
            />
            <AnalyticsLine
              label="Completion Rate"
              value={`${Math.round(details?.analytics.completionRate ?? 0)}%`}
            />
            <AnalyticsLine
              label="Students At Risk"
              value={String(details?.analytics.studentsAtRisk ?? 0)}
            />
            <AnalyticsLine
              label="Top Student"
              value={details?.analytics.topStudent?.student.name ?? "No top student yet"}
            />
          </div>
        </section>
        <LeaderboardTable students={topFive} />
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Edit Class</h2>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-stone-foreground/70">Class name</span>
              <input
                className="teacher-input"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-game text-sm"
                onClick={() => void saveClass()}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {creatingGuide ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 px-4 py-8">
          <section className="teacher-card w-full max-w-2xl p-5">
            <h2 className="font-display text-xl text-primary">Create Quest Guide</h2>
            <div className="mt-4 grid gap-3">
              <input
                className="teacher-input"
                placeholder="Guide title"
                value={guideDraft.title}
                onChange={(event) =>
                  setGuideDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
              <input
                className="teacher-input"
                placeholder="Topic"
                value={guideDraft.topic}
                onChange={(event) =>
                  setGuideDraft((current) => ({ ...current, topic: event.target.value }))
                }
              />
              <textarea
                className="teacher-input min-h-24"
                placeholder="Short explanation"
                value={guideDraft.shortExplanation}
                onChange={(event) =>
                  setGuideDraft((current) => ({ ...current, shortExplanation: event.target.value }))
                }
              />
              <input
                className="teacher-input"
                placeholder="Example problem"
                value={guideDraft.exampleProblem}
                onChange={(event) =>
                  setGuideDraft((current) => ({ ...current, exampleProblem: event.target.value }))
                }
              />
              <textarea
                className="teacher-input min-h-28"
                placeholder="Solution steps, one per line"
                value={guideDraft.solutionStepsText}
                onChange={(event) =>
                  setGuideDraft((current) => ({
                    ...current,
                    solutionStepsText: event.target.value,
                  }))
                }
              />
              <textarea
                className="teacher-input min-h-20"
                placeholder="Tips, one per line"
                value={guideDraft.tipsText}
                onChange={(event) =>
                  setGuideDraft((current) => ({ ...current, tipsText: event.target.value }))
                }
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setCreatingGuide(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn-game text-sm" onClick={() => void saveGuide()}>
                Save Guide
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {creatingQuest && currentClassSection ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8">
          <div className="mx-auto max-w-5xl">
            <CreateQuestWizard
              sections={[currentClassSection]}
              initialSectionId={classId}
              onCancel={() => setCreatingQuest(false)}
              onComplete={() => {
                setCreatingQuest(false);
                void load();
              }}
            />
          </div>
        </div>
      ) : null}
      {studentToRemove ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Remove Student</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Remove {studentToRemove.name} from this class? Their historical progress remains
              available in reports.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setStudentToRemove(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-game text-sm"
                onClick={() => void removeStudent(studentToRemove)}
              >
                Remove
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {confirmingDelete && details ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Delete Class</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Delete {details.classInfo.name}? This is only allowed when the class has no students,
              quests, guides, or progress.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn-game text-sm" onClick={() => void deleteClass()}>
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  danger,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="teacher-card p-4">
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${danger ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}
      >
        {icon}
      </div>
      <p className="text-sm text-stone-foreground/65">{label}</p>
      <p className={`font-display text-2xl ${danger ? "text-destructive" : "text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function ContentList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-black/20 p-4">
      <h3 className="font-display text-lg text-primary">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm text-stone-foreground/75">
        {items.length > 0 ? (
          items.slice(0, 5).map((item) => <p key={item}>{item}</p>)
        ) : (
          <p>Nothing assigned yet.</p>
        )}
      </div>
    </div>
  );
}

function AnalyticsLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-black/20 p-3">
      <span className="text-sm text-stone-foreground/70">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}
