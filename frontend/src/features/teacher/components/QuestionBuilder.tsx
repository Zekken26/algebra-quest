import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { MathInput } from "@/shared/components/MathInput";
import { MathRenderer } from "@/shared/components/MathRenderer";
import type { QuestionType } from "@/features/teacher/types/teacher.types";

type QuestionData = {
  equation: string;
  questionType: QuestionType;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  matchingPairs?: Array<{ left: string; right: string }>;
  enumerationItems?: string[];
};

type QuestionBuilderProps = {
  questions: QuestionData[];
  onChange: (questions: QuestionData[]) => void;
  allowedTypes?: QuestionType[];
  disabled?: boolean;
};

const questionTypeLabels: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  IDENTIFICATION: "Identification",
  MATCHING: "Matching",
  ENUMERATION: "Enumeration",
  SHORT_ANSWER: "Short Answer",
  ESSAY: "Essay",
};

const defaultTypes: QuestionType[] = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "IDENTIFICATION",
  "MATCHING",
  "ENUMERATION",
  "SHORT_ANSWER",
  "ESSAY",
];

export function QuestionBuilder({
  questions,
  onChange,
  allowedTypes = defaultTypes,
  disabled,
}: QuestionBuilderProps) {
  const filteredTypes = allowedTypes.filter((t) => defaultTypes.includes(t));
  const [textMode, setTextMode] = useState<Record<number, boolean>>({});

  const toggleMathMode = (index: number) => {
    setTextMode((prev) => {
      const next = { ...prev };
      if (next[index]) {
        delete next[index];
      } else {
        next[index] = true;
      }
      return next;
    });
  };

  const addQuestion = () => {
    const newQuestion: QuestionData = {
      equation: "",
      questionType: filteredTypes[0] ?? "MULTIPLE_CHOICE",
      choices: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      points: 1,
      matchingPairs: [{ left: "", right: "" }],
      enumerationItems: [""],
    };
    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionData>) => {
    onChange(
      questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-primary">Questions</h3>
        <button
          type="button"
          className="btn-game text-xs"
          onClick={addQuestion}
          disabled={disabled}
        >
          <Plus className="h-3 w-3" /> Add Question
        </button>
      </div>

      {questions.length === 0 && (
        <p className="text-sm text-stone-foreground/60 py-4 text-center">
          No questions yet. Click "Add Question" to get started.
        </p>
      )}

      {questions.map((question, index) => (
        <article
          key={index}
          className="rounded-2xl border border-primary/15 bg-black/20 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-sm text-primary">Question {index + 1}</span>
            <button
              type="button"
              className="text-destructive/70 hover:text-destructive transition-colors"
              onClick={() => removeQuestion(index)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-stone-foreground/60">Type</span>
                <select
                  className="teacher-input"
                  value={question.questionType}
                  onChange={(e) => {
                    const newType = e.target.value as QuestionType;
                    const updated: Partial<QuestionData> = { questionType: newType };
                    if (newType === "TRUE_FALSE") {
                      updated.choices = ["True", "False"];
                      updated.correctAnswer = "True";
                      updated.matchingPairs = undefined;
                      updated.enumerationItems = undefined;
                    } else if (newType === "MATCHING") {
                      updated.choices = [];
                      updated.correctAnswer = "";
                      updated.matchingPairs = question.matchingPairs ?? [{ left: "", right: "" }];
                      updated.enumerationItems = undefined;
                    } else if (newType === "ENUMERATION") {
                      updated.choices = [];
                      updated.correctAnswer = "";
                      updated.matchingPairs = undefined;
                      updated.enumerationItems = question.enumerationItems ?? [""];
                    } else if (newType === "IDENTIFICATION" || newType === "SHORT_ANSWER" || newType === "ESSAY") {
                      updated.choices = [];
                      updated.matchingPairs = undefined;
                      updated.enumerationItems = undefined;
                    } else {
                      updated.choices = question.choices.length === 0 ? ["", "", "", ""] : question.choices;
                      updated.matchingPairs = undefined;
                      updated.enumerationItems = undefined;
                    }
                    updateQuestion(index, updated);
                  }}
                >
                  {filteredTypes.map((type) => (
                    <option key={type} value={type}>
                      {questionTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-stone-foreground/60">Points</span>
                <input
                  type="number"
                  className="teacher-input"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </label>
            </div>

            <label className="grid gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-foreground/60">Question</span>
                <button
                  type="button"
                  onClick={() => toggleMathMode(index)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    textMode[index]
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-stone-foreground/10 text-stone-foreground/60 border border-transparent"
                  }`}
                >
                  {textMode[index] ? "Text" : "Math"}
                </button>
              </div>
              <MathInput
                className="teacher-input"
                placeholder="Enter the question..."
                value={question.equation}
                onChange={(v) => updateQuestion(index, { equation: v })}
                mathMode={!textMode[index]}
              />
            </label>
            {question.equation && (
              <div className="rounded-xl border border-primary/10 bg-black/20 p-3 text-center">
                <span className="block text-xs font-semibold text-stone-foreground/60 mb-1">Preview</span>
                <MathRenderer latex={question.equation} displayMode />
              </div>
            )}

            {question.questionType === "MULTIPLE_CHOICE" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {question.choices.map((choice, ci) => (
                  <label key={ci} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={question.correctAnswer === choice}
                      onChange={() => updateQuestion(index, { correctAnswer: choice })}
                      className="h-4 w-4 accent-primary shrink-0"
                    />
                    <input
                      className="teacher-input text-sm"
                      placeholder={`Choice ${ci + 1}`}
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...question.choices];
                        newChoices[ci] = e.target.value;
                        updateQuestion(index, { choices: newChoices });
                      }}
                    />
                  </label>
                ))}
              </div>
            )}

            {question.questionType === "TRUE_FALSE" && (
              <div className="flex gap-4">
                {["True", "False"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`tf-${index}`}
                      checked={question.correctAnswer === option}
                      onChange={() => updateQuestion(index, { correctAnswer: option })}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.questionType === "IDENTIFICATION" && (
              <label className="grid gap-1">
                <span className="text-xs text-stone-foreground/60">Correct Answer</span>
                <input
                  className="teacher-input"
                  placeholder="Enter the correct answer..."
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                />
              </label>
            )}

            {question.questionType === "SHORT_ANSWER" && (
              <label className="grid gap-1">
                <span className="text-xs text-stone-foreground/60">Correct Answer</span>
                <input
                  className="teacher-input"
                  placeholder="Enter the expected answer..."
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                />
              </label>
            )}

            {question.questionType === "ESSAY" && (
              <div className="rounded-xl border border-primary/10 bg-black/20 p-3">
                <p className="text-xs text-stone-foreground/60">Essay question — students will write a response. No auto-grade.</p>
              </div>
            )}

            {question.questionType === "MATCHING" && (
              <div className="grid gap-2">
                <span className="text-xs text-stone-foreground/60">Matching Pairs</span>
                {question.matchingPairs?.map((pair, pi) => (
                  <div key={pi} className="flex items-center gap-2">
                    <input
                      className="teacher-input text-sm flex-1"
                      placeholder={`Left ${pi + 1}`}
                      value={pair.left}
                      onChange={(e) => {
                        const newPairs = [...(question.matchingPairs ?? [])];
                        newPairs[pi] = { ...newPairs[pi], left: e.target.value };
                        updateQuestion(index, { matchingPairs: newPairs });
                      }}
                    />
                    <span className="text-stone-foreground/40">↔</span>
                    <input
                      className="teacher-input text-sm flex-1"
                      placeholder={`Right ${pi + 1}`}
                      value={pair.right}
                      onChange={(e) => {
                        const newPairs = [...(question.matchingPairs ?? [])];
                        newPairs[pi] = { ...newPairs[pi], right: e.target.value };
                        updateQuestion(index, { matchingPairs: newPairs });
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive/60 hover:text-destructive shrink-0"
                      onClick={() => {
                        const newPairs = question.matchingPairs?.filter((_, i) => i !== pi) ?? [];
                        updateQuestion(index, { matchingPairs: newPairs });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-game btn-stone text-xs w-fit"
                  onClick={() => {
                    const newPairs = [...(question.matchingPairs ?? []), { left: "", right: "" }];
                    updateQuestion(index, { matchingPairs: newPairs });
                  }}
                >
                  + Add Pair
                </button>
              </div>
            )}

            {question.questionType === "ENUMERATION" && (
              <div className="grid gap-2">
                <span className="text-xs text-stone-foreground/60">Enumeration Items (one per line)</span>
                <textarea
                  className="teacher-input min-h-20"
                  placeholder="Enter each item on a new line..."
                  value={question.enumerationItems?.join("\n") ?? ""}
                  onChange={(e) => {
                    const items = e.target.value.split("\n").filter(Boolean);
                    updateQuestion(index, { enumerationItems: items });
                  }}
                />
                <p className="text-xs text-stone-foreground/40">Separate each item with a new line.</p>
              </div>
            )}

            <label className="grid gap-1">
              <span className="text-xs text-stone-foreground/60">Explanation</span>
              <textarea
                className="teacher-input min-h-16"
                placeholder="Explanation shown after answering..."
                value={question.explanation}
                onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
              />
            </label>
          </div>
        </article>
      ))}
    </div>
  );
}

export type { QuestionData };
