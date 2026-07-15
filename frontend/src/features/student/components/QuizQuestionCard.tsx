import { motion } from "framer-motion";
import type { AlgebraQuestion } from "@/features/student/types/student.types";
import { MathRenderer } from "@/shared/components/MathRenderer";

type QuizQuestionCardProps = {
  question: AlgebraQuestion;
  index: number;
  total: number;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
};

export function QuizQuestionCard({
  question,
  index,
  total,
  selectedAnswer,
  onSelect,
}: QuizQuestionCardProps) {
  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      className="quest-panel p-5 sm:p-7"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-accent">
          Question {index + 1} of {total}
        </p>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full bg-[var(--gradient-gold)]"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

<div className="panel-parchment p-6 text-center whitespace-normal break-words leading-relaxed">
  <MathRenderer
    latex={question.prompt}
    displayMode
    className="text-4xl text-parchment-foreground sm:text-6xl"
  />
</div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onSelect(choice)}
            className={`answer-card ${selectedAnswer === choice ? "border-primary shadow-[var(--shadow-glow-gold)]" : ""}`}
          >
            <MathRenderer latex={choice} />
          </button>
        ))}
      </div>
    </motion.section>
  );
}
