import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ActivityList } from "./ActivityList";
import { ModuleActivityForm } from "./ModuleActivityForm";
import { QuestionBuilder } from "./QuestionBuilder";
import { SettingsPanel, SettingsField, ToggleField } from "./SettingsPanel";
import {
  fetchAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  togglePublishAssessment,
  fetchTeacherSections,
  type AssessmentItem,
} from "@/features/teacher/services/teacherService";
import type { QuestionData } from "./QuestionBuilder";
import type { TeacherSection } from "@/features/teacher/services/teacherService";

export function AssessmentBuilder() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [timeLimit, setTimeLimit] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [attemptsAllowed, setAttemptsAllowed] = useState("1");
  const [autoGrade, setAutoGrade] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleChoices, setShuffleChoices] = useState(false);

  const load = useCallback(async () => {
    try {
      const [items, secs] = await Promise.all([
        fetchAssessments(),
        fetchTeacherSections(),
      ]);
      setAssessments(items);
      setSections(secs);
    } catch (error: any) {
      toast.error(error.message || "Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = assessments.find((a) => a.id === selectedId);

  const handleCreate = () => {
    navigate({ to: "/teacher/assessments/create" });
  };

  const handleEdit = (item: any) => {
    const assessment = assessments.find((a) => a.id === item.id);
    if (!assessment) return;
    setEditingId(assessment.id);
    setQuestions(
      (assessment.questions ?? []).map((q) => ({
        equation: q.equation,
        questionType: q.questionType ?? "MULTIPLE_CHOICE",
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
        matchingPairs: undefined,
        enumerationItems: undefined,
      })),
    );
    setTimeLimit(assessment.timeLimitMinutes?.toString() ?? "");
    setPassingScore(assessment.passingScore?.toString() ?? "");
    setAttemptsAllowed(assessment.attemptsAllowed?.toString() ?? "1");
    setAutoGrade(assessment.autoGrade ?? true);
    setShuffleQuestions(assessment.shuffleQuestions ?? false);
    setShuffleChoices(assessment.shuffleChoices ?? false);
    setShowForm(true);
  };

  const handleSaveForm = async (data: {
    title: string;
    description: string | null;
    instructions: string | null;
    dueDate: string | null;
    availableFrom: string | null;
    availableTo: string | null;
    totalPoints: number | null;
    isPublished: boolean;
    sectionIds: string[];
  }) => {
    const baseInput = {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      dueDate: data.dueDate,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      totalPoints: data.totalPoints,
      timeLimitMinutes: timeLimit ? parseInt(timeLimit, 10) : null,
      passingScore: passingScore ? parseInt(passingScore, 10) : null,
      attemptsAllowed: parseInt(attemptsAllowed, 10) || 1,
      autoGrade,
      shuffleQuestions,
      shuffleChoices,
      isPublished: data.isPublished,
      questions: questions.map((q) => ({
        equation: q.equation,
        questionType: q.questionType,
        choices: q.questionType === "TRUE_FALSE" ? ["True", "False"] : q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      })),
    };

    try {
      if (editingId) {
        await updateAssessment(editingId, baseInput);
        toast.success("Assessment updated.");
      } else {
        const firstSectionId = data.sectionIds[0] || sections[0]?.id;
        if (!firstSectionId) {
          toast.error("No class available. Create a class first.");
          return;
        }
        for (const sid of data.sectionIds.length > 0 ? data.sectionIds : [firstSectionId]) {
          await createAssessment({ ...baseInput, sectionId: sid });
        }
        toast.success("Assessment created.");
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (error: any) {
      toast.error(error.message || "Failed to save assessment.");
    }
  };

  const handleTogglePublish = async (item: any) => {
    try {
      await togglePublishAssessment(item.id);
      toast.success("Publish status updated.");
      await load();
    } catch (error: any) {
      toast.error(error.message || "Failed to update publish status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAssessment(deletingId);
      toast.success("Assessment deleted.");
      setDeletingId(null);
      if (selectedId === deletingId) setSelectedId(null);
      await load();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete assessment.");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="teacher-card p-5">
          <p className="text-sm text-stone-foreground/60">Loading assessments...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <ActivityList
        items={assessments.map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: a.dueDate ? `Due: ${new Date(a.dueDate).toLocaleDateString()}` : a.description ?? undefined,
          status: a.isPublished ? "published" : "draft",
          stats: [
            { label: "Questions", value: a._count?.questions ?? a.questions?.length ?? 0 },
            { label: "Time Limit", value: a.timeLimitMinutes ? `${a.timeLimitMinutes} min` : "None" },
            { label: "Passing Score", value: a.passingScore?.toString() ?? "—" },
            { label: "Attempts", value: a.attemptsAllowed ?? 1 },
          ],
        }))}
        onCreate={handleCreate}
        onSelect={(item) => setSelectedId(item.id)}
        onEdit={handleEdit}
        onDelete={(item) => setDeletingId(item.id)}
        onTogglePublish={handleTogglePublish}
        selectedId={selectedId ?? undefined}
        title="Assessments"
        subtitle="Create and manage assessments."
        createLabel="Create Assessment"
      />

      <div className="space-y-6">
        {selected ? (
          <section className="teacher-card p-5">
            <h2 className="font-display text-xl text-primary">{selected.title}</h2>
            <p className="mt-1 text-sm text-stone-foreground/70">
              {selected.description ?? "No description."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {selected.dueDate && (
                <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                  <p className="text-xs text-stone-foreground/60">Due Date</p>
                  <p className="mt-0.5 text-sm text-primary">{new Date(selected.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              {selected.timeLimitMinutes && (
                <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                  <p className="text-xs text-stone-foreground/60">Time Limit</p>
                  <p className="mt-0.5 text-sm text-primary">{selected.timeLimitMinutes} min</p>
                </div>
              )}
              <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                <p className="text-xs text-stone-foreground/60">Passing Score</p>
                <p className="mt-0.5 text-sm text-primary">{selected.passingScore ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                <p className="text-xs text-stone-foreground/60">Auto-Grade</p>
                <p className="mt-0.5 text-sm text-primary">{selected.autoGrade ? "Yes" : "No"}</p>
              </div>
              <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                <p className="text-xs text-stone-foreground/60">Attempts</p>
                <p className="mt-0.5 text-sm text-primary">{selected.attemptsAllowed ?? 1}</p>
              </div>
              <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                <p className="text-xs text-stone-foreground/60">Status</p>
                <p className="mt-0.5 text-sm text-primary">{selected.isPublished ? "Published" : "Draft"}</p>
              </div>
            </div>
            {selected.questions && selected.questions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-display text-lg text-primary">Questions ({selected.questions.length})</h3>
                <div className="mt-2 grid gap-2">
                  {selected.questions.map((q, i) => (
                    <div key={q.id} className="rounded-xl border border-primary/10 bg-black/20 p-3">
                      <p className="text-sm text-primary">{q.equation}</p>
                      <p className="text-xs text-stone-foreground/60 mt-1">
                        Type: {q.questionType} | {q.points} pt(s)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="teacher-card p-5">
            <h2 className="font-display text-xl text-primary">Assessment Details</h2>
            <p className="mt-3 text-sm text-stone-foreground/70">
              Select an assessment to view its details.
            </p>
          </section>
        )}
      </div>

      {showForm && (
        <ModuleActivityForm
          title={editingId ? "Edit Assessment" : "Create Assessment"}
          initial={
            editingId
              ? {
                  title: selected?.title,
                  description: selected?.description,
                  instructions: selected?.instructions,
                  dueDate: selected?.dueDate ?? undefined,
                  availableFrom: selected?.availableFrom ?? undefined,
                  availableTo: selected?.availableTo ?? undefined,
                  totalPoints: selected?.maxScore,
                  isPublished: selected?.isPublished,
                }
              : undefined
          }
          onSave={handleSaveForm}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        >
          <SettingsPanel title="Assessment Settings">
            <SettingsField label="Time Limit (minutes)">
              <input type="number" className="teacher-input" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} min={1} placeholder="Optional" />
            </SettingsField>
            <SettingsField label="Passing Score">
              <input type="number" className="teacher-input" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} min={0} placeholder="Optional" />
            </SettingsField>
            <SettingsField label="Attempts Allowed">
              <input type="number" className="teacher-input" value={attemptsAllowed} onChange={(e) => setAttemptsAllowed(e.target.value)} min={1} />
            </SettingsField>
            <SettingsField label="" fullWidth>
              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleField label="Auto-Grade" checked={autoGrade} onChange={setAutoGrade} />
                <ToggleField label="Shuffle Questions" checked={shuffleQuestions} onChange={setShuffleQuestions} />
                <ToggleField label="Shuffle Choices" checked={shuffleChoices} onChange={setShuffleChoices} />
              </div>
            </SettingsField>
          </SettingsPanel>

          <div className="mt-4">
            <QuestionBuilder
              questions={questions}
              onChange={setQuestions}
              allowedTypes={["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "ESSAY", "SHORT_ANSWER"]}
            />
          </div>
        </ModuleActivityForm>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Delete Assessment</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Are you sure you want to delete this assessment?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-game btn-stone text-sm" onClick={() => setDeletingId(null)}>Cancel</button>
              <button type="button" className="btn-game text-sm" onClick={() => void handleDelete()}>Delete</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
