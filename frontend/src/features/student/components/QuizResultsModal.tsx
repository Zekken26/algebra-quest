import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles, Swords } from "lucide-react";
import type { QuizResult } from "@/features/student/types/student.types";

type QuizResultsModalProps = {
  moduleId: string;
  result: QuizResult;
  onRetake: () => void;
};

export function QuizResultsModal({ moduleId, result, onRetake }: QuizResultsModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="quest-panel max-h-[90vh] w-full max-w-2xl overflow-auto p-6"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[var(--gradient-gold)] text-2xl shadow-[var(--shadow-glow-gold)]">
            {result.passed ? "★" : "!"}
          </div>
          <h2 className="font-display text-3xl text-primary">
            {result.passed ? "Quest Gate Unlocked" : "More Study Needed"}
          </h2>
          <p className="mt-2 text-stone-foreground/75">
            Score: {result.score}% ({result.total - result.mistakes.length}/{result.total})
          </p>
        </div>

        {result.mistakes.length > 0 ? (
          <div className="mt-6 space-y-3">
            <h3 className="font-display text-lg text-primary">Mistakes and explanations</h3>
            {result.mistakes.map((mistake) => (
              <div
                key={mistake.question.id}
                className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
              >
                <p className="font-display text-lg">{mistake.question.prompt}</p>
                <p className="text-sm text-stone-foreground/80">
                  Your answer: {mistake.selectedAnswer ?? "No answer"}. Correct answer:{" "}
                  {mistake.question.answer}.
                </p>
                <p className="mt-2 text-sm text-stone-foreground/75">
                  {mistake.question.explanation}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {!result.passed ? (
            <button onClick={onRetake} className="btn-game">
              <RotateCcw className="h-4 w-4" /> Retake Quiz
            </button>
          ) : (
            <Link to="/student/modules/$moduleId/game" params={{ moduleId }} className="btn-game">
              <Swords className="h-4 w-4" /> Enter Algebra Quest
            </Link>
          )}
          <Link to="/student" className="btn-game btn-stone">
            <Sparkles className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
