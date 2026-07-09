import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { ClassContentType } from "@/features/teacher/types/teacher.types";

type QuestionInput = {
  equation: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
};

type ClassContentFormProps = {
  type: ClassContentType;
  classId: string;
  sectionId: string;
  onClose: () => void;
  onCreated: () => void;
};

function newQuestion(): QuestionInput {
  return {
    equation: "",
    choices: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 1,
  };
}

const TYPE_LABELS: Record<ClassContentType, string> = {
  ASSIGNMENT: "Assignment",
  PRETEST: "Pre-Test",
  ASSESSMENT: "Assessment",
};

export function ClassContentForm({ type, classId, sectionId, onClose, onCreated }: ClassContentFormProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionInput[]>([newQuestion()]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => setQuestions((prev) => [...prev, newQuestion()]);
  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, patch: Partial<QuestionInput>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateChoice = (qIndex: number, cIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, choices: q.choices.map((c, j) => (j === cIndex ? value : c)) }
          : q,
      ),
    );
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.equation.trim()) {
        toast.error(`Question ${i + 1}: equation is required.`);
        return false;
      }
      const validChoices = q.choices.filter((c) => c.trim());
      if (validChoices.length < 2) {
        toast.error(`Question ${i + 1}: at least 2 choices required.`);
        return false;
      }
      if (!q.correctAnswer.trim()) {
        toast.error(`Question ${i + 1}: select a correct answer.`);
        return false;
      }
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { createClassContent } = await import(
        "@/features/teacher/services/teacherService"
      );
      await createClassContent({
        title: title.trim(),
        type,
        instructions: instructions.trim(),
        timeLimitMinutes,
        isPublished: true,
        classId,
        sectionId,
        questions: questions.map((q) => ({
          equation: q.equation.trim(),
          choices: q.choices.map((c) => c.trim()),
          correctAnswer: q.correctAnswer.trim(),
          explanation: q.explanation.trim(),
          points: q.points || 1,
        })),
      });
      toast.success(`${TYPE_LABELS[type]} created.`);
      onCreated();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create content.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-primary/20 bg-[var(--color-background)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl text-primary">New {TYPE_LABELS[type]}</h2>
          <button type="button" className="btn-game btn-stone text-xs" onClick={onClose}>
            <X className="h-4 w-4" /> Close
          </button>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold text-stone-foreground/80">Title</span>
              <input
                className="teacher-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. Week 1 ${TYPE_LABELS[type]}`}
              />
            </label>
            {type !== "ASSIGNMENT" ? (
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-stone-foreground/80">
                  Time Limit (minutes)
                </span>
                <input
                  className="teacher-input"
                  type="number"
                  min={1}
                  max={180}
                  value={timeLimitMinutes ?? ""}
                  onChange={(e) => setTimeLimitMinutes(e.target.value ? Number(e.target.value) : null)}
                  placeholder="No limit"
                />
              </label>
            ) : null}
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-stone-foreground/80">Instructions</span>
            <textarea
              className="teacher-input min-h-20"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instructions for students..."
            />
          </label>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-foreground/80">
                Questions ({questions.length})
              </span>
              <button
                type="button"
                className="btn-game btn-stone text-xs"
                onClick={addQuestion}
              >
                <Plus className="h-3.5 w-3.5" /> Add Question
              </button>
            </div>
            <div className="grid gap-4">
              {questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="rounded-xl border border-primary/10 bg-black/20 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">Question {qIndex + 1}</span>
                    <button
                      type="button"
                      className="text-xs text-destructive disabled:opacity-40"
                      onClick={() => removeQuestion(qIndex)}
                      disabled={questions.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-xs text-stone-foreground/60">Equation</span>
                      <input
                        className="teacher-input"
                        value={question.equation}
                        onChange={(e) => updateQuestion(qIndex, { equation: e.target.value })}
                        placeholder="e.g. 2x + 5 = 15"
                      />
                    </label>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.choices.map((choice, cIndex) => (
                        <label key={cIndex} className="grid gap-1">
                          <span className="text-xs text-stone-foreground/60">
                            Choice {cIndex + 1}
                          </span>
                          <input
                            className="teacher-input"
                            value={choice}
                            onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                            placeholder={`Answer choice ${cIndex + 1}`}
                          />
                        </label>
                      ))}
                    </div>

                    <label className="grid gap-1">
                      <span className="text-xs text-stone-foreground/60">Correct Answer</span>
                      <select
                        className="teacher-input"
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                      >
                        <option value="">Select correct answer</option>
                        {question.choices.map((choice, cIndex) =>
                          choice.trim() ? (
                            <option key={cIndex} value={choice}>
                              {choice}
                            </option>
                          ) : null,
                        )}
                      </select>
                    </label>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="grid gap-1">
                        <span className="text-xs text-stone-foreground/60">Explanation</span>
                        <input
                          className="teacher-input"
                          value={question.explanation}
                          onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                          placeholder="Explain the answer..."
                        />
                      </label>
                      {type === "ASSESSMENT" ? (
                        <label className="grid gap-1">
                          <span className="text-xs text-stone-foreground/60">Points</span>
                          <input
                            className="teacher-input"
                            type="number"
                            min={1}
                            max={100}
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(qIndex, { points: Number(e.target.value) || 1 })
                            }
                          />
                        </label>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-game btn-stone text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-game text-sm"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? "Creating..." : `Create ${TYPE_LABELS[type]}`}
          </button>
        </div>
      </div>
    </div>
  );
}
