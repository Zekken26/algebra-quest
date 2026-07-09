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
        <MathInput
          className="teacher-input"
          placeholder="Question prompt, e.g. 2x + 5 = 15"
          value={equation}
          onChange={setEquation}
        />
        {equation ? (
          <div className="rounded-xl border border-primary/10 bg-black/20 p-3 text-center">
            <span className="text-xs font-semibold text-stone-foreground/60 block mb-1">Preview</span>
            <MathRenderer latex={equation} displayMode />
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
