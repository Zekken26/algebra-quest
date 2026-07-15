import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock, Loader2, Send, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import {
  answerStudentContentQuestion,
  fetchStudentContentDetail,
  getStudentProgress,
  startStudentContentAttempt,
  submitStudentContentAttempt,
  toStudentProgressFromDashboard,
  type StudentContentItem,
} from "@/features/student/services/studentService";
import { fetchStudentDashboard } from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";

const TYPE_LABELS = {
  ASSIGNMENT: "Assignment",
  PRETEST: "Pre-Test",
  ASSESSMENT: "Assessment",
};

type Props = {
  contentId: string;
};

export function StudentContentPage({ contentId }: Props) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<StudentProgress>(() => getStudentProgress());
  const [content, setContent] = useState<StudentContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; totalScore: number; passed: boolean } | null>(null);
  const [answering, setAnswering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboard, detail] = await Promise.all([
        fetchStudentDashboard(),
        fetchStudentContentDetail(contentId),
      ]);
      setProgress(toStudentProgressFromDashboard(dashboard, progress));
      setContent(detail.content);
      const existingAttempt = detail.content.attempts?.find((a) => !a.submittedAt);
      if (existingAttempt) {
        setAttemptId(existingAttempt.id);
        setFinished(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load content.");
      navigate({ to: "/student" });
    } finally {
      setLoading(false);
    }
  }, [contentId, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const questions = content?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLast = currentQuestionIndex >= questions.length - 1;

  const completedAttempt = content?.attempts?.find((a) => a.submittedAt);
  const hasCompleted = !!completedAttempt;

  const startAttempt = async () => {
    try {
      const res = await startStudentContentAttempt(contentId);
      setAttemptId(res.attempt.id);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswerResult(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start.");
    }
  };

  const handleAnswer = async () => {
    if (!selectedAnswer || !attemptId) return;
    setAnswering(true);
    try {
      const result = await answerStudentContentQuestion(contentId, currentQuestion.id, selectedAnswer);
      setAnswerResult(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit answer.");
    } finally {
      setAnswering(false);
    }
  };

  const nextQuestion = () => {
    if (isLast) {
      void submitFinal();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswerResult(null);
    }
  };

  const submitFinal = async () => {
    setSubmitting(true);
    try {
      const result = await submitStudentContentAttempt(contentId);
      setFinalScore(result);
      setFinished(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ForestBackground>
        <StudentNavbar progress={progress} />
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      </ForestBackground>
    );
  }

  if (!content) return null;

  return (
    <ForestBackground>
      <StudentNavbar progress={progress} />
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/student" className="btn-game btn-stone mb-5 text-sm">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <section className="quest-hero mb-6 p-6 sm:p-8">
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
            {TYPE_LABELS[content.type]}
          </p>
          <h1 className="mt-2 font-display text-4xl text-primary glow-text sm:text-5xl">
            {content.title}
          </h1>
          {content.instructions ? (
            <p className="mt-3 text-stone-foreground/80">{content.instructions}</p>
          ) : null}
          {content.timeLimitMinutes ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-stone-foreground/60">
              <Clock className="h-4 w-4" /> {content.timeLimitMinutes} minutes
            </p>
          ) : null}
        </section>

        {hasCompleted && !attemptId ? (
          <section className="quest-panel p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" />
            <h2 className="font-display text-2xl text-primary">Completed</h2>
            <p className="mt-2 text-stone-foreground/70">
              Score: {completedAttempt.score}/{completedAttempt.totalScore}
            </p>
            <Link to="/student" className="btn-game btn-stone mx-auto mt-4 inline-flex text-sm">
              Back to Dashboard
            </Link>
          </section>
        ) : finished && finalScore ? (
          <section className="quest-panel p-6 text-center">
            <div className="mx-auto mb-3">
              {finalScore.passed ? (
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              ) : (
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
              )}
            </div>
            <h2 className="font-display text-2xl text-primary">
              {finalScore.passed ? "Passed!" : "Try Again"}
            </h2>
            <p className="mt-2 text-stone-foreground/70">
              Score: {finalScore.score}/{finalScore.totalScore}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/student" className="btn-game btn-stone text-sm">
                Dashboard
              </Link>
              <button
                type="button"
                className="btn-game text-sm"
                onClick={() => {
                  setFinished(false);
                  setAttemptId(null);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setAnswerResult(null);
                  setFinalScore(null);
                  void load();
                }}
              >
                Retry
              </button>
            </div>
          </section>
        ) : !attemptId ? (
          <section className="quest-panel p-6 text-center">
            <p className="mb-4 text-stone-foreground/70">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
            <button
              type="button"
              className="btn-game text-sm"
              onClick={() => void startAttempt()}
            >
              Start {TYPE_LABELS[content.type]}
            </button>
          </section>
        ) : (
          <section className="quest-panel p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-stone-foreground/60">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {content.timeLimitMinutes ? (
                <span className="flex items-center gap-1 text-sm text-stone-foreground/60">
                  <Clock className="h-4 w-4" /> {content.timeLimitMinutes} min
                </span>
              ) : null}
            </div>

            <div className="mb-2 h-2 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {currentQuestion ? (
              <div className="mt-6">
                {currentQuestion.imageUrl ? (
                  <img
                    src={currentQuestion.imageUrl}
                    alt=""
                    className="mb-4 w-full rounded-xl"
                  />
                ) : null}
<p className="mb-6 text-center font-display text-2xl text-primary whitespace-normal break-words leading-relaxed">
  {currentQuestion.equation}
</p>

                <div className="grid gap-3">
                  {currentQuestion.choices.map((choice) => {
                    let choiceClass =
                      "rounded-xl border p-4 text-center font-semibold transition-all cursor-pointer hover:border-primary/40 hover:bg-primary/5";
                    if (answerResult) {
                      if (choice === currentQuestion.correctAnswer) {
                        choiceClass += " border-success bg-success/10 text-success";
                      } else if (choice === selectedAnswer && !answerResult.isCorrect) {
                        choiceClass += " border-destructive bg-destructive/10 text-destructive";
                      } else {
                        choiceClass += " opacity-50";
                      }
                    } else if (selectedAnswer === choice) {
                      choiceClass += " border-primary bg-primary/10";
                    } else {
                      choiceClass += " border-primary/10 bg-black/20";
                    }
                    return (
                      <button
                        key={choice}
                        type="button"
                        className={choiceClass}
                        onClick={() => !answerResult && setSelectedAnswer(choice)}
                        disabled={!!answerResult}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>

                {answerResult ? (
                  <div className="mt-4 rounded-xl bg-black/20 p-4">
                    <p
                      className={`font-semibold ${answerResult.isCorrect ? "text-success" : "text-destructive"}`}
                    >
                      {answerResult.isCorrect ? "Correct!" : "Incorrect"}
                    </p>
                    <p className="mt-2 text-sm text-stone-foreground/70">
                      {answerResult.explanation}
                    </p>
                    <button
                      type="button"
                      className="btn-game mt-4 text-sm"
                      onClick={nextQuestion}
                      disabled={submitting}
                    >
                      {submitting
                        ? "Submitting..."
                        : isLast
                          ? "View Results"
                          : "Next Question"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="btn-game text-sm"
                      onClick={() => void handleAnswer()}
                      disabled={!selectedAnswer || answering}
                    >
                      {answering ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Checking
                        </>
                      ) : (
                        <>
                          <Send className="mr-1 h-4 w-4" /> Submit Answer
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </ForestBackground>
  );
}
