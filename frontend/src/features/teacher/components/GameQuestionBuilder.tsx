import { useState } from "react";

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
        <input
          className="teacher-input"
          placeholder="Equation challenge"
          value={equation}
          onChange={(event) => setEquation(event.target.value)}
        />
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
