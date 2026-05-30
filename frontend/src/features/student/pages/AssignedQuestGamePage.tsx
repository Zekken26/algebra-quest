import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { AnswerChoices } from "@/features/student/components/AnswerChoices";
import { EquationCard } from "@/features/student/components/EquationCard";
import { GameShopPanel } from "@/features/student/components/GameShopPanel";
import { GuideDialogueBox } from "@/features/student/components/GuideDialogueBox";
import { HintPanel } from "@/features/student/components/HintPanel";
import { PuzzleProgressBoard } from "@/features/student/components/PuzzleProgressBoard";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import { playSound } from "@/shared/utils/sound";
import {
  ApiRequestError,
  answerAssignedQuestQuestion,
  completeAssignedQuest,
  fetchStudentDashboard,
  fetchStudentAssignedQuest,
  getStudentProgress,
  purchaseShopItem,
  saveStudentProgress,
  startAssignedQuest,
  type StudentAssignedQuest,
  type StudentDashboardData,
  toStudentProgressFromDashboard,
  toStudentProgressFromUser,
  useAssignedQuestHint as requestAssignedQuestHint,
} from "@/features/student/services/studentService";
import type { QuizStatus } from "@/features/student/types/student.types";

type AssignedQuestGamePageProps = {
  questId: string;
};

export function AssignedQuestGamePage({ questId }: AssignedQuestGamePageProps) {
  const navigate = useNavigate();
  const [quest, setQuest] = useState<StudentAssignedQuest | null>(null);
  const [lockedQuest, setLockedQuest] = useState<{ message: string; requiredLevel?: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [answering, setAnswering] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"good" | "bad" | "neutral">("neutral");
  const [guideMessage, setGuideMessage] = useState("Choose an answer to recover a relic piece.");
  const [revealedHintsByQuestion, setRevealedHintsByQuestion] = useState<Record<string, string[]>>(
    {},
  );
  const [progress, setProgress] = useState<
    NonNullable<StudentAssignedQuest["progress"]>[number] | null
  >(null);
  const [navbarProgress, setNavbarProgress] = useState(() => getStudentProgress());

  const syncProgress = (
    nextProgress: NonNullable<StudentAssignedQuest["progress"]>[number] | null,
    activeQuestId = questId,
    user?: StudentDashboardData["student"],
  ) => {
    setProgress(nextProgress);
    setNavbarProgress((current) => {
      const fromUser = toStudentProgressFromUser(user, current);
      const next = {
        ...fromUser,
        activeQuestId,
        coins: user?.coins ?? nextProgress?.coins ?? fromUser.coins,
        hearts: user?.hearts ?? nextProgress?.heartsRemaining ?? fromUser.hearts,
        hintTokens: user?.hintTokens ?? nextProgress?.hintTokens ?? fromUser.hintTokens,
      };
      saveStudentProgress(next);
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;

    const loadQuest = async () => {
      try {
        const nextQuest = await fetchStudentAssignedQuest(questId);
        const dashboard = await fetchStudentDashboard();
        if (!mounted) return;
        const nextProgress = nextQuest.progress?.[0] ?? null;
        setQuest(nextQuest);
        setNavbarProgress(toStudentProgressFromDashboard(dashboard));
        syncProgress(nextProgress, nextQuest.id, dashboard.student);
        setStarted(
          Boolean(
            nextProgress?.questUnlocked &&
            !nextProgress.questCompleted &&
            nextProgress.heartsRemaining > 0,
          ),
        );
        if (nextProgress && nextQuest.questions?.length) {
          setQuestionIndex(
            (nextProgress.correctAnswers + nextProgress.wrongAnswers) % nextQuest.questions.length,
          );
        }
      } catch (error) {
        if (error instanceof ApiRequestError && error.locked) {
          if (!mounted) return;
          setLockedQuest({
            message:
              error.lockReason ??
              `Complete Level ${error.requiredLevel ?? "the previous quest"} first.`,
            requiredLevel: error.requiredLevel,
          });
          return;
        }
        toast.error(error instanceof Error ? error.message : "Unable to load quest.");
        navigate({ to: "/student" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadQuest();

    return () => {
      mounted = false;
    };
  }, [navigate, questId]);

  const questions = quest?.questions ?? [];
  const question = questions[questionIndex % Math.max(questions.length, 1)];
  const guideViewed = !quest?.guideId || Boolean(progress?.guideViewed);
  const canAct =
    started && status === "idle" && !answering && Boolean(question) && !progress?.questCompleted;

  const moduleLike = useMemo(
    () => ({
      title: quest?.title ?? "Assigned Quest",
      topic: quest?.topic ?? "Algebra",
      requiredPieces: quest?.requiredPuzzlePieces ?? 1,
    }),
    [quest],
  );

  const begin = async () => {
    if (!quest) return;
    if (progress?.questUnlocked && !progress.questCompleted && progress.heartsRemaining > 0) {
      setStarted(true);
      setGuideMessage("Quest continued. Keep solving from where you left off.");
      return;
    }
    setStarting(true);
    try {
      const nextProgress = await startAssignedQuest(quest.id);
      syncProgress(nextProgress, quest.id);
      setStarted(true);
      setGuideMessage("Quest started. Solve each equation carefully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start quest.";
      if (error instanceof ApiRequestError && error.guideRequired) {
        toast.info("Review the Quest Guide before starting this quest.");
        navigate({ to: "/student/quests/$questId/lesson", params: { questId: quest.id } });
        return;
      }
      toast.error(message);
    } finally {
      setStarting(false);
    }
  };

  const choose = async (choice: string) => {
    if (!quest || !question || !canAct) return;
    setPicked(choice);
    setAnswering(true);

    try {
      const result = await answerAssignedQuestQuestion(quest.id, question.id, choice);
      syncProgress(result.progress, quest.id, result.user);
      playSound(result.isCorrect ? "correct" : "wrong");
      setFeedback(result.isCorrect ? "good" : "bad");
      setStatus(result.isCorrect ? "correct" : "wrong");
      setStreak((current) => (result.isCorrect ? current + 1 : 0));
      setGuideMessage(result.feedback);

      if (result.progress.questCompleted) {
        window.setTimeout(() => playSound("complete"), 360);
        const completedProgress = await completeAssignedQuest(quest.id);
        syncProgress(completedProgress, quest.id);
        toast.success("Quest completed.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit answer.");
      setStatus("idle");
      setPicked(null);
    } finally {
      setAnswering(false);
    }
  };

  const nextQuestion = () => {
    setPicked(null);
    setStatus("idle");
    setFeedback("neutral");
    setGuideMessage("The path shifts. Solve the next equation.");
    setQuestionIndex((index) => (index + 1) % Math.max(questions.length, 1));
  };

  const refreshQuestProgress = async () => {
    if (!quest) return;
    const nextQuest = await fetchStudentAssignedQuest(quest.id);
    setQuest(nextQuest);
    syncProgress(nextQuest.progress?.[0] ?? null, nextQuest.id);
  };

  const requestHint = async () => {
    if (!quest || !question || !canAct) return;

    try {
      const result = await requestAssignedQuestHint(quest.id, question.id);
      syncProgress(result.progress, quest.id);
      if (result.noMoreHints || !result.hintStep) {
        setGuideMessage("No more hints available for this question.");
        toast.info("No more hints available for this question.");
        return;
      }
      const hintStep = result.hintStep;
      setRevealedHintsByQuestion((current) => ({
        ...current,
        [question.id]: [...(current[question.id] ?? []), hintStep],
      }));
      setGuideMessage(`Step ${result.hintStepIndex + 1}: ${hintStep}`);
      setFeedback("neutral");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to use hint.");
    }
  };

  const buyShopItem = async (itemType: "health" | "hint") => {
    if (!quest || !started) return;

    try {
      await purchaseShopItem(itemType, quest.id);
      await refreshQuestProgress();
      toast.success(itemType === "health" ? "Health restored." : "Hint added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to buy item.");
    }
  };

  const skipQuestion = async () => {
    if (!quest || !canAct) return;

    try {
      await purchaseShopItem("skip", quest.id);
      await refreshQuestProgress();
      nextQuestion();
      toast.success("Puzzle skipped.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to skip puzzle.");
    }
  };

  if (loading) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <section className="quest-panel flex items-center gap-2 p-6 text-sm text-stone-foreground/75">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading quest...
          </section>
        </main>
      </ForestBackground>
    );
  }

  if (lockedQuest) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <section className="quest-panel max-w-md p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-primary/25 bg-black/25 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-3xl text-primary">Quest Locked</h1>
            <p className="mt-2 text-sm text-stone-foreground/75">{lockedQuest.message}</p>
            <Link to="/student" className="btn-game mt-5 text-sm">
              Back to My Quests
            </Link>
          </section>
        </main>
      </ForestBackground>
    );
  }

  if (!quest) return null;

  if (!guideViewed) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <section className="quest-panel max-w-md p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-primary/25 bg-black/25 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-3xl text-primary">Quest Guide Required</h1>
            <p className="mt-2 text-sm text-stone-foreground/75">
              Read the quest guide first before entering this challenge.
            </p>
            <Link
              to="/student/quests/$questId/lesson"
              params={{ questId }}
              className="btn-game mt-5 text-sm"
            >
              Go to Quest Guide
            </Link>
          </section>
        </main>
      </ForestBackground>
    );
  }

  if (!question) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <section className="quest-panel max-w-md p-6 text-center">
            <h1 className="font-display text-3xl text-primary">No questions yet</h1>
            <p className="mt-2 text-sm text-stone-foreground/75">
              Ask your teacher to add questions before starting this quest.
            </p>
            <Link to="/student" className="btn-game mt-5 text-sm">
              Return
            </Link>
          </section>
        </main>
      </ForestBackground>
    );
  }

  return (
    <ForestBackground>
      <StudentNavbar progress={navbarProgress} />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/student" className="btn-game btn-stone text-sm">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="hud-chip">Assigned to: {quest.section?.name ?? "your class"}</div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <section className="space-y-5">
            <EquationCard
              moduleTitle={quest.title}
              question={{
                id: question.id,
                prompt: question.equation,
                choices: question.choices,
                answer: "",
                explanation: "",
                hint: "",
              }}
            />
            <AnswerChoices
              choices={question.choices}
              picked={picked}
              status={status}
              disabled={answering}
              onChoose={choose}
            />
            <div className="flex justify-end">
              {started ? (
                <button
                  onClick={nextQuestion}
                  disabled={status === "idle" || progress?.questCompleted}
                  className="btn-game"
                >
                  Next Puzzle <Play className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => void begin()} disabled={starting} className="btn-game">
                  {starting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Begin Quest
                </button>
              )}
            </div>
            <GuideDialogueBox message={guideMessage} feedback={feedback} questTitle={quest.title} />
          </section>

          <aside className="space-y-5">
            <PuzzleProgressBoard
              pieces={progress?.puzzlePieces ?? 0}
              requiredPieces={moduleLike.requiredPieces}
            />
            <HintPanel
              hints={progress?.hintTokens ?? navbarProgress.hintTokens}
              streak={streak}
              canAct={canAct}
              revealedHints={revealedHintsByQuestion[question.id] ?? []}
              onHint={() => void requestHint()}
              onSkip={() => void skipQuestion()}
            />
            <GameShopPanel
              coins={progress?.coins ?? navbarProgress.coins}
              hearts={progress?.heartsRemaining ?? navbarProgress.hearts}
              maxHearts={quest.maxHearts}
              canAct={started && !progress?.questCompleted}
              onBuy={(item) => {
                if (item === "skip") return;
                void buyShopItem(item);
              }}
            />
            <section className="quest-panel p-5">
              <p className="font-display text-xl text-primary">Quest Stats</p>
              <div className="mt-4 space-y-2 text-sm text-stone-foreground/75">
                <p>Score: {progress?.score ?? 0}</p>
                <p>Hearts: {progress?.heartsRemaining ?? quest.maxHearts}</p>
                <p>Hints used: {progress?.hintsUsed ?? 0}</p>
                <p>Hint tokens: {progress?.hintTokens ?? navbarProgress.hintTokens}</p>
                <p>Correct: {progress?.correctAnswers ?? 0}</p>
                <p>Wrong: {progress?.wrongAnswers ?? 0}</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </ForestBackground>
  );
}
