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
          <div className="flex gap-0.5 rounded-full bg-stone-foreground/10 p-0.5">
            <button
              type="button"
              onClick={() => setMathMode(true)}
              className={`text-xs px-2.5 py-0.5 rounded-full transition-colors ${
                mathMode
                  ? "bg-primary/20 text-primary"
                  : "text-stone-foreground/60 hover:text-stone-foreground/80"
              }`}
            >
              Math
            </button>
            <button
              type="button"
              onClick={() => setMathMode(false)}
              className={`text-xs px-2.5 py-0.5 rounded-full transition-colors ${
                !mathMode
                  ? "bg-primary/20 text-primary"
                  : "text-stone-foreground/60 hover:text-stone-foreground/80"
              }`}
            >
              Text
            </button>
          </div>
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
            {!mathMode ? (
              <>
                <p className="text-sm text-stone-foreground/80 whitespace-pre-wrap">{equation}</p>
                {!equation.includes(" ") && equation.length > 3 && (
                  <p className="text-xs text-amber-400/70 mt-1">No spaces — re-type in Text mode to preserve them.</p>
                )}
              </>
            ) : (
              <MathRenderer latex={equation} displayMode />
            )}
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
