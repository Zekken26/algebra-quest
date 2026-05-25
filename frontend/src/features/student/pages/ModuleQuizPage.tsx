import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Timer } from "lucide-react";
import { ForestBackground } from "@/components/ForestBackground";
import { QuizQuestionCard } from "@/features/student/components/QuizQuestionCard";
import { QuizResultsModal } from "@/features/student/components/QuizResultsModal";
import {
  PASSING_SCORE,
  getStudentModule,
  updateStudentProgress,
} from "@/features/student/services/studentService";
import type { QuizResult } from "@/features/student/types/student.types";

type ModuleQuizPageProps = {
  moduleId: string;
};

export function ModuleQuizPage({ moduleId }: ModuleQuizPageProps) {
  const navigate = useNavigate();
  const module = getStudentModule(moduleId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = module?.quiz[currentIndex];
  const progressPercent = module ? ((currentIndex + 1) / module.quiz.length) * 100 : 0;

  const selectedAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    return answers[currentQuestion.id] ?? null;
  }, [answers, currentQuestion]);

  if (!module || !currentQuestion) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <div className="quest-panel p-6 text-center">
            <h1 className="font-display text-3xl text-primary">Quiz not found</h1>
            <button onClick={() => navigate({ to: "/student" })} className="btn-game mt-4">
              Return
            </button>
          </div>
        </main>
      </ForestBackground>
    );
  }

  const submitQuiz = () => {
    const mistakes = module.quiz
      .filter((question) => answers[question.id] !== question.answer)
      .map((question) => ({ question, selectedAnswer: answers[question.id] ?? null }));
    const score = Math.round(((module.quiz.length - mistakes.length) / module.quiz.length) * 100);
    const passed = score >= PASSING_SCORE;
    const quizResult = { score, total: module.quiz.length, passed, mistakes };

    updateStudentProgress((progress) => ({
      ...progress,
      xp: passed ? progress.xp + 50 : progress.xp,
      modules: {
        ...progress.modules,
        [module.id]: {
          ...progress.modules[module.id],
          completion: passed
            ? Math.max(progress.modules[module.id].completion, 70)
            : progress.modules[module.id].completion,
          quizPassed: passed,
          bestQuizScore: Math.max(progress.modules[module.id].bestQuizScore, score),
        },
      },
    }));
    setResult(quizResult);
  };

  const retake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  return (
    <ForestBackground>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/student/modules/$moduleId/lesson"
            params={{ moduleId }}
            className="btn-game btn-stone text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Lesson
          </Link>
          <div className="hud-chip">
            <Timer className="h-4 w-4 text-primary" /> Focus run
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
          <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
            {module.title}
          </p>
          <h1 className="font-display text-4xl text-primary glow-text">Module Quiz</h1>
          <div className="mt-4 h-3 overflow-hidden rounded-full border border-primary/25 bg-black/25">
            <div
              className="h-full bg-[var(--gradient-gold)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </motion.div>

        <QuizQuestionCard
          question={currentQuestion}
          index={currentIndex}
          total={module.quiz.length}
          selectedAnswer={selectedAnswer}
          onSelect={(answer) =>
            setAnswers((previous) => ({ ...previous, [currentQuestion.id]: answer }))
          }
        />

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            disabled={currentIndex === 0}
            className="btn-game btn-stone"
          >
            Previous
          </button>
          {currentIndex < module.quiz.length - 1 ? (
            <button
              onClick={() =>
                setCurrentIndex((index) => Math.min(module.quiz.length - 1, index + 1))
              }
              disabled={!selectedAnswer}
              className="btn-game"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < module.quiz.length}
              className="btn-game"
            >
              Submit Quiz
            </button>
          )}
        </div>

        {result ? (
          <QuizResultsModal moduleId={module.id} result={result} onRetake={retake} />
        ) : null}
      </main>
    </ForestBackground>
  );
}
