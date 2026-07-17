import { useState } from "react";
import { MathInput } from "@/shared/components/MathInput";
import { MathRenderer } from "@/shared/components/MathRenderer";

type QuizBuilderProps = {
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

export function QuizBuilder({ disabled, onAddQuestion }: QuizBuilderProps) {
  const [equation, setEquation] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mathMode, setMathMode] = useState(true);

  const submit = async () => {
    setSubmitting(true);
    try {
      await onAddQuestion({
        equation,
        choices,
        correctAnswer: choices[0],
        explanation,
        solutionSteps: explanation.split("\n").filter(Boolean),
        difficulty: "Easy",
      });
      setEquation("");
      setChoices(["", "", "", ""]);
      setExplanation("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="teacher-card p-5">
      <h2 className="font-display text-xl text-primary">Quiz Builder</h2>
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
          placeholder="Question prompt, e.g. 2x + 5 = 15"
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
        <div className="grid gap-3 sm:grid-cols-2">
          {choices.map((choice, index) => (
            <input
              key={index}
              className="teacher-input"
              placeholder={`Choice ${index + 1}${index === 0 ? " (correct)" : ""}`}
              value={choice}
              onChange={(event) =>
                setChoices((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item,
                  ),
                )
              }
            />
          ))}
        </div>
        <textarea
          className="teacher-input min-h-24"
          placeholder="Explanation shown after mistakes"
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
        />
        <button
          type="button"
          className="btn-game w-fit text-sm"
          disabled={disabled || submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Adding..." : "Add Quiz Question"}
        </button>
      </div>
    </section>
  );
}
