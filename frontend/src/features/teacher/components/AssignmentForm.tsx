import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DateTimeInput } from "@/shared/components/DateTimeInput";
import { createClassContent } from "@/features/teacher/services/teacherService";
import type { ClassContentItem, ClassContentType } from "@/features/teacher/types/teacher.types";

type AssignmentFormProps = {
  classId: string;
  contentType: ClassContentType;
  onClose: () => void;
  onCreated: () => void;
  editItem?: ClassContentItem | null;
};

type QuestionDraft = {
  equation: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
};

function emptyQuestion(): QuestionDraft {
  return { equation: "", choices: ["", "", "", ""], correctAnswer: "", explanation: "", points: 1 };
}

export function AssignmentForm({ classId, contentType, onClose, onCreated, editItem }: AssignmentFormProps) {
  const [title, setTitle] = useState(editItem?.title ?? "");
  const [description, setDescription] = useState(editItem?.description ?? "");
  const [dueDate, setDueDate] = useState(editItem?.dueDate?.split("T")[0] ?? "");
  const [timeLimit, setTimeLimit] = useState(editItem?.timeLimitMinutes ? String(editItem.timeLimitMinutes) : "");
  const [instructions, setInstructions] = useState(editItem?.instructions ?? "");
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    editItem?.questions?.map((q) => ({
      equation: q.equation,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
    })) ?? [emptyQuestion()],
  );
  const [saving, setSaving] = useState(false);

  const addQuestion = () => setQuestions((q) => [...q, emptyQuestion()]);
  const removeQuestion = (idx: number) => setQuestions((q) => q.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, field: keyof QuestionDraft, value: string | number) => {
    setQuestions((q) => q.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const updateChoice = (qIdx: number, cIdx: number, value: string) => {
    setQuestions((q) =>
      q.map((item, i) =>
        i === qIdx ? { ...item, choices: item.choices.map((c, j) => (j === cIdx ? value : c)) } : item,
      ),
    );
  };

  const save = async () => {
    if (!title.trim()) { toast.error("Title is required."); return; }
    if (questions.length === 0) { toast.error("Add at least one question."); return; }

    const validQuestions = questions.map((q) => ({
      equation: q.equation.trim() || "Solve for x",
      choices: q.choices.map((c) => c.trim() || "0"),
      correctAnswer: q.correctAnswer.trim() || q.choices[0]?.trim() || "0",
      explanation: q.explanation.trim(),
      points: q.points || 1,
    }));

    setSaving(true);
    try {
      await createClassContent({
        title: title.trim(),
        type: contentType,
        sectionId: classId,
        description: description.trim() || null,
        instructions: instructions.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        timeLimitMinutes: timeLimit ? Number(timeLimit) : null,
        isPublished: false,
        questions: validQuestions,
      });
      toast.success(`${contentType === "ASSIGNMENT" ? "Assignment" : contentType === "PRETEST" ? "Pre-Test" : "Assessment"} created.`);
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create.");
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = contentType === "ASSIGNMENT" ? "Assignment" : contentType === "PRETEST" ? "Pre-Test" : "Assessment";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 px-4 py-8">
      <section className="teacher-card w-full max-w-3xl p-5">
        <h2 className="font-display text-xl text-primary">{editItem ? "Edit" : "Create"} {typeLabel}</h2>

        <div className="mt-4 grid gap-4">
          <input className="teacher-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="teacher-input min-h-20" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <textarea className="teacher-input min-h-20" placeholder="Instructions (optional)" value={instructions} onChange={(e) => setInstructions(e.target.value)} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs text-stone-foreground/60">Due Date</span>
              <DateTimeInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-stone-foreground/60">Time Limit (minutes, optional)</span>
              <input className="teacher-input" type="number" min="0" max="180" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
            </label>
          </div>

          <div className="border-t border-primary/10 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base text-primary">Questions</h3>
              <button type="button" className="btn-game btn-stone text-xs" onClick={addQuestion}>
                <Plus className="h-3.5 w-3.5" /> Add Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="mb-4 rounded-xl border border-primary/15 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Question {qIdx + 1}</span>
                  {questions.length > 1 ? (
                    <button type="button" className="text-destructive/70 hover:text-destructive" onClick={() => removeQuestion(qIdx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <input className="teacher-input mb-2" placeholder="Equation (e.g., 2x + 3 = 7)" value={q.equation} onChange={(e) => updateQuestion(qIdx, "equation", e.target.value)} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.choices.map((choice, cIdx) => (
                    <label key={cIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswer === choice}
                        onChange={() => updateQuestion(qIdx, "correctAnswer", choice)}
                        className="accent-primary"
                      />
                      <input
                        className="teacher-input flex-1"
                        placeholder={`Choice ${cIdx + 1}`}
                        value={choice}
                        onChange={(e) => updateChoice(qIdx, cIdx, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input className="teacher-input" placeholder="Explanation" value={q.explanation} onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)} />
                  <input className="teacher-input" type="number" min="0" max="100" placeholder="Points" value={q.points} onChange={(e) => updateQuestion(qIdx, "points", Number(e.target.value) || 1)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="btn-game btn-stone text-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="btn-game text-sm" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving..." : editItem ? "Save Changes" : `Create ${typeLabel}`}
          </button>
        </div>
      </section>
    </div>
  );
}
