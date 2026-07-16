import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ActivityList } from "./ActivityList";
import { ModuleActivityForm } from "./ModuleActivityForm";
import { QuestionBuilder } from "./QuestionBuilder";
import { SettingsPanel, SettingsField, ToggleField } from "./SettingsPanel";
import {
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  togglePublishAssignment,
  duplicateAssignment,
  fetchTeacherSections,
  type AssignmentItem,
} from "@/features/teacher/services/teacherService";
import type { QuestionData } from "./QuestionBuilder";
import type { TeacherSection } from "@/features/teacher/services/teacherService";

export function AssignmentBuilder() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [submissionType, setSubmissionType] = useState<string>("MULTIPLE_CHOICE");
  const [passingScore, setPassingScore] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [items, secs] = await Promise.all([
        fetchAssignments(),
        fetchTeacherSections(),
      ]);
      setAssignments(items);
      setSections(secs);
    } catch (error: any) {
      toast.error(error.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = assignments.find((a) => a.id === selectedId);

  const handleCreate = () => {
    navigate({ to: "/teacher/assignments/create" });
  };

  const handleEdit = (item: any) => {
    const assignment = assignments.find((a) => a.id === item.id);
    if (!assignment) return;
    setEditingId(assignment.id);
    setQuestions(
      (assignment.questions ?? []).map((q) => ({
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
    setSubmissionType(assignment.submissionType ?? "MULTIPLE_CHOICE");
    setPassingScore(assignment.passingScore?.toString() ?? "");
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
      submissionType,
      passingScore: passingScore ? parseInt(passingScore, 10) : null,
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
        await updateAssignment(editingId, baseInput);
        toast.success("Assignment updated.");
      } else {
        const firstSectionId = data.sectionIds[0] || sections[0]?.id;
        if (!firstSectionId) {
          toast.error("No class available. Create a class first.");
          return;
        }
        for (const sid of data.sectionIds.length > 0 ? data.sectionIds : [firstSectionId]) {
          await createAssignment({ ...baseInput, sectionId: sid });
        }
        toast.success("Assignment created.");
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (error: any) {
      toast.error(error.message || "Failed to save assignment.");
    }
  };

  const handleTogglePublish = async (item: any) => {
    try {
      await togglePublishAssignment(item.id);
      toast.success("Publish status updated.");
      await load();
    } catch (error: any) {
      toast.error(error.message || "Failed to update publish status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAssignment(deletingId);
      toast.success("Assignment deleted.");
      setDeletingId(null);
      if (selectedId === deletingId) setSelectedId(null);
      await load();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete assignment.");
    }
  };

  const handleDuplicate = async (item: any) => {
    try {
      await duplicateAssignment(item.id);
      toast.success("Assignment duplicated.");
      await load();
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate assignment.");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="teacher-card p-5">
          <p className="text-sm text-stone-foreground/60">Loading assignments...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <ActivityList
        items={assignments.map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: a.dueDate ? `Due: ${new Date(a.dueDate).toLocaleDateString()}` : a.description ?? undefined,
          status: a.isPublished ? "published" : "draft",
          stats: [
            { label: "Points", value: a.maxScore ?? "—" },
            { label: "Questions", value: a._count?.questions ?? a.questions?.length ?? 0 },
            { label: "Submissions", value: a._count?.attempts ?? 0 },
            { label: "Type", value: a.submissionType ?? "—" },
          ],
        }))}
        onCreate={handleCreate}
        onSelect={(item) => setSelectedId(item.id)}
        onEdit={handleEdit}
        onDelete={(item) => setDeletingId(item.id)}
        onTogglePublish={handleTogglePublish}
        onDuplicate={handleDuplicate}
        selectedId={selectedId ?? undefined}
        title="Assignments"
        subtitle="Create and manage assignments."
        createLabel="Create Assignment"
      />

      <div className="space-y-6">
        {selected ? (
          <>
            <section className="teacher-card p-5">
              <h2 className="font-display text-xl text-primary">{selected.title}</h2>
              <p className="mt-1 text-sm text-stone-foreground/70">
                {selected.description ?? "No description."}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {selected.dueDate && (
                  <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                    <p className="text-xs text-stone-foreground/60">Due Date</p>
                    <p className="mt-0.5 text-sm text-primary">
                      {new Date(selected.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                  <p className="text-xs text-stone-foreground/60">Total Points</p>
                  <p className="mt-0.5 text-sm text-primary">{selected.maxScore ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                  <p className="text-xs text-stone-foreground/60">Submission Type</p>
                  <p className="mt-0.5 text-sm text-primary">{selected.submissionType ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                  <p className="text-xs text-stone-foreground/60">Status</p>
                  <p className="mt-0.5 text-sm text-primary">
                    {selected.isPublished ? "Published" : "Draft"}
                  </p>
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
          </>
        ) : (
          <section className="teacher-card p-5">
            <h2 className="font-display text-xl text-primary">Assignment Details</h2>
            <p className="mt-3 text-sm text-stone-foreground/70">
              Select an assignment to view its details.
            </p>
          </section>
        )}
      </div>

      {showForm && (
        <ModuleActivityForm
          title={editingId ? "Edit Assignment" : "Create Assignment"}
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
          <SettingsPanel title="Assignment Settings">
            <SettingsField label="Submission Type">
              <select
                className="teacher-input"
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value)}
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="FILE_UPLOAD">File Upload</option>
                <option value="ESSAY">Essay</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="ATTACHMENTS">Attachments</option>
              </select>
            </SettingsField>
            <SettingsField label="Passing Score">
              <input
                type="number"
                className="teacher-input"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                min={0}
                placeholder="Optional"
              />
            </SettingsField>
          </SettingsPanel>

          <div className="mt-4">
            <QuestionBuilder
              questions={questions}
              onChange={setQuestions}
              allowedTypes={["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "SHORT_ANSWER", "ESSAY"]}
            />
          </div>
        </ModuleActivityForm>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Delete Assignment</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Are you sure you want to delete this assignment?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-game text-sm"
                onClick={() => void handleDelete()}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
