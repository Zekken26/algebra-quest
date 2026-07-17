import { useState } from "react";
import { MathInput } from "@/shared/components/MathInput";
import { MathRenderer } from "@/shared/components/MathRenderer";

type GameQuestionBuilderProps = {
  disabled?: boolean;
  onAddQuestion: (question: {
    equation: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
    solutionSteps: string[];
    difficulty: string;
  }) => Promise<void>;
};

export function GameQuestionBuilder({ disabled, onAddQuestion }: GameQuestionBuilderProps) {
  const [equation, setEquation] = useState("");
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mathMode, setMathMode] = useState(true);

  const submit = async () => {
    setSubmitting(true);
    try {
      await onAddQuestion({
        equation,
        choices: [answer, "Try again", "Review guide", "Skip"],
        correctAnswer: answer,
        explanation: hint,
        solutionSteps: hint.split("\n").filter(Boolean),
        difficulty: "Medium",
      });
      setEquation("");
      setAnswer("");
      setHint("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="teacher-card p-5">
      <h2 className="font-display text-xl text-primary">Game Question Builder</h2>
      <div className="mt-4 grid gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-foreground/60">Question</span>
          <button
            type="button"
            onClick={() => setMathMode((m) => !m)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              !mathMode
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-stone-foreground/10 text-stone-foreground/60 border border-transparent"
            }`}
          >
            {mathMode ? "Math" : "Text"}
          </button>
        </div>
        <MathInput
          className="teacher-input"
          placeholder="Equation challenge"
          value={equation}
          onChange={setEquation}
          mathMode={mathMode}
        />
        {equation ? (
          <div className="rounded-xl border border-primary/10 bg-black/20 p-3 text-center">
            <span className="text-xs font-semibold text-stone-foreground/60 block mb-1">Preview</span>
            <MathRenderer latex={equation} displayMode />
          </div>
        ) : null}
        <input
          className="teacher-input"
          placeholder="Correct answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
        />
        <textarea
          className="teacher-input min-h-24"
          placeholder="Hint or wizard dialogue"
          value={hint}
          onChange={(event) => setHint(event.target.value)}
        />
        <button
          type="button"
          className="btn-game w-fit text-sm"
          disabled={disabled || submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Adding..." : "Add Game Question"}
        </button>
      </div>
    </section>
  );
}
