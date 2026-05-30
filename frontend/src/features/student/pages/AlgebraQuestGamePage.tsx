import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { AnswerChoices } from "@/features/student/components/AnswerChoices";
import { EquationCard } from "@/features/student/components/EquationCard";
import { GameHUD } from "@/features/student/components/GameHUD";
import { GameShopPanel } from "@/features/student/components/GameShopPanel";
import { GuideDialogueBox } from "@/features/student/components/GuideDialogueBox";
import { HintPanel } from "@/features/student/components/HintPanel";
import { LevelCompleteModal } from "@/features/student/components/LevelCompleteModal";
import { PuzzleProgressBoard } from "@/features/student/components/PuzzleProgressBoard";
import { playSound } from "@/shared/utils/sound";
import {
  getStudentModule,
  getStudentModules,
  getStudentProgress,
  purchaseShopItem,
  updateStudentProgress,
} from "@/features/student/services/studentService";
import type { QuizStatus } from "@/features/student/types/student.types";

type AlgebraQuestGamePageProps = {
  moduleId: string;
};

const DEFAULT_MAX_HEARTS = 3;

function isBackendCoinMismatch(error: unknown) {
  return (
    error instanceof Error &&
    /not have enough coins|not enough coins|insufficient_coins/i.test(error.message)
  );
}

export function AlgebraQuestGamePage({ moduleId }: AlgebraQuestGamePageProps) {
  const navigate = useNavigate();
  const module = getStudentModule(moduleId);
  const initialProgress = useMemo(() => getStudentProgress(), []);
  const moduleProgress = module ? initialProgress.modules[module.id] : undefined;
  const isResumingAttempt = Boolean(
    module && initialProgress.activeQuestId === module.id && !moduleProgress?.gameCompleted,
  );
  const startingHearts = isResumingAttempt ? initialProgress.hearts : DEFAULT_MAX_HEARTS;
  const startingPieces = module
    ? Math.min(module.requiredPieces, isResumingAttempt ? (moduleProgress?.relicPieces ?? 0) : 0)
    : 0;
  const startingQuestionIndex =
    module && isResumingAttempt
      ? (moduleProgress?.currentQuestionIndex ?? 0) % module.gameQuestions.length
      : 0;
  const [introOpen, setIntroOpen] = useState(!isResumingAttempt);
  const [hearts, setHearts] = useState(startingHearts);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [xp, setXp] = useState(initialProgress.xp);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [coins, setCoins] = useState(initialProgress.coins);
  const [pieces, setPieces] = useState(startingPieces);
  const [questionIndex, setQuestionIndex] = useState(startingQuestionIndex);
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [streak, setStreak] = useState(0);
  const [hints, setHints] = useState(initialProgress.hintTokens);
  const [guideMessage, setGuideMessage] = useState(
    "Read the equation like a balanced scale. Choose carefully to recover a relic piece.",
  );
  const [revealedHintsByQuestion, setRevealedHintsByQuestion] = useState<Record<string, string[]>>(
    {},
  );
  const [feedback, setFeedback] = useState<"good" | "bad" | "neutral">("neutral");
  const [levelComplete, setLevelComplete] = useState(false);
  const [levelFailed, setLevelFailed] = useState(isResumingAttempt && startingHearts <= 0);

  const question = module?.gameQuestions[questionIndex % (module?.gameQuestions.length || 1)];

  useEffect(() => {
    if (module && moduleProgress?.status === "locked") {
      navigate({ to: "/student" });
    }

    if (module && moduleProgress && !moduleProgress.guideViewed) {
      navigate({ to: "/student/modules/$moduleId/lesson", params: { moduleId: module.id } });
    }
  }, [module, moduleProgress, navigate]);

  if (!module || !question) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <div className="quest-panel p-6 text-center">
            <h1 className="font-display text-3xl text-primary">Level not found</h1>
            <Link to="/student" className="btn-game mt-4">
              Return
            </Link>
          </div>
        </main>
      </ForestBackground>
    );
  }

  const canAct = status === "idle" && !levelComplete && !levelFailed;
  const maxHearts = DEFAULT_MAX_HEARTS;

  const saveCompletion = (finalCoins: number, finalXp: number) => {
    updateStudentProgress((progress) => {
      const nextModules = { ...progress.modules };
      nextModules[module.id] = {
        ...nextModules[module.id],
        status: "completed",
        completion: 100,
        guideViewed: true,
        quizPassed: true,
        gameCompleted: true,
        relicPieces: module.requiredPieces,
        currentQuestionIndex: questionIndex,
        badge: `${module.title} Relic Keeper`,
      };

      const moduleIndex = getStudentModules().findIndex((item) => item.id === module.id);
      const nextModule = getStudentModules()[moduleIndex + 1];
      if (nextModule && nextModules[nextModule.id].status === "locked") {
        nextModules[nextModule.id] = {
          ...nextModules[nextModule.id],
          status: "unlocked",
        };
      }

      return {
        ...progress,
        xp: finalXp,
        coins: finalCoins,
        currentLevel: nextModule?.title ?? module.title,
        hintTokens: hints,
        hearts,
        activeQuestId: null,
        modules: nextModules,
      };
    });
  };

  const persistLiveStats = (
    nextStats: Partial<Pick<typeof initialProgress, "coins" | "hintTokens" | "hearts">> & {
      xpDelta?: number;
      relicPieces?: number;
      questionIndex?: number;
    },
  ) => {
    updateStudentProgress((progress) => {
      const nextModules = { ...progress.modules };
      const moduleProgress = nextModules[module.id];
      const relicPieces = nextStats.relicPieces ?? moduleProgress.relicPieces;
      const relicCompletion = Math.round((relicPieces / module.requiredPieces) * 100);

      nextModules[module.id] = {
        ...moduleProgress,
        status: moduleProgress.status === "locked" ? "unlocked" : moduleProgress.status,
        completion: relicCompletion,
        guideViewed: true,
        relicPieces,
        currentQuestionIndex: nextStats.questionIndex ?? moduleProgress.currentQuestionIndex,
      };

      return {
        ...progress,
        xp: progress.xp + (nextStats.xpDelta ?? 0),
        coins: nextStats.coins ?? progress.coins,
        hintTokens: nextStats.hintTokens ?? progress.hintTokens,
        hearts: nextStats.hearts ?? progress.hearts,
        activeQuestId: module.id,
        modules: nextModules,
      };
    });
  };

  const choose = (choice: string) => {
    if (!canAct) return;
    setPicked(choice);

    if (choice === question.answer) {
      playSound("correct");
      const nextPieces = pieces + 1;
      const nextScore = score + 10;
      const questCoinReward = module.requiredPieces * 10;
      const questXpReward = module.requiredPieces * 10;
      const questWillComplete = nextPieces >= module.requiredPieces;
      const nextCoinsEarned = questWillComplete ? questCoinReward : coinsEarned;
      const nextCoins = questWillComplete ? coins + questCoinReward : coins;
      const nextXpEarned = questWillComplete ? questXpReward : xpEarned;
      const nextXp = questWillComplete ? xp + questXpReward : xp;

      setStatus("correct");
      setPieces(nextPieces);
      setScore(nextScore);
      setXpEarned(nextXpEarned);
      setXp(nextXp);
      setCoinsEarned(nextCoinsEarned);
      setCoins(nextCoins);
      setStreak((value) => value + 1);
      setFeedback("good");
      setGuideMessage(
        questWillComplete
          ? `Excellent. You completed the relic and earned ${questCoinReward} coins and ${questXpReward} XP.`
          : "Excellent. You recovered a puzzle piece.",
      );

      if (questWillComplete) {
        window.setTimeout(() => playSound("complete"), 360);
        persistLiveStats({ xpDelta: questXpReward, coins: nextCoins, relicPieces: nextPieces });
        saveCompletion(nextCoins, nextXp);
        window.setTimeout(() => setLevelComplete(true), 650);
      } else {
        persistLiveStats({
          relicPieces: nextPieces,
          questionIndex: (questionIndex + 1) % module.gameQuestions.length,
        });
      }
      return;
    }

    const nextHearts = hearts - 1;
    playSound("wrong");
    setStatus("wrong");
    setHearts(nextHearts);
    setStreak(0);
    setFeedback("bad");
    setGuideMessage(`${question.explanation} Keep going. A wrong answer is still a clue.`);
    persistLiveStats({ hearts: Math.max(nextHearts, 0) });

    if (nextHearts <= 0) {
      window.setTimeout(() => setLevelFailed(true), 650);
    }
  };

  const advanceToNextQuestion = () => {
    setPicked(null);
    setStatus("idle");
    setFeedback("neutral");
    setGuideMessage("The path shifts. Solve the next equation to recover another relic piece.");
    setQuestionIndex((index) => {
      const nextIndex = (index + 1) % module.gameQuestions.length;
      persistLiveStats({ questionIndex: nextIndex });
      return nextIndex;
    });
  };

  const nextQuestion = () => {
    advanceToNextQuestion();
  };

  const useHint = () => {
    if (!canAct || hints <= 0) return;
    const revealedHints = revealedHintsByQuestion[question.id] ?? [];
    if (revealedHints.length > 0) {
      setGuideMessage("No more hints available for this question.");
      toast.info("No more hints available for this question.");
      return;
    }
    const nextHints = hints - 1;
    setHints(nextHints);
    const hintStep = question.hint.replace(/^Step\s*1:\s*/i, "");
    setRevealedHintsByQuestion((current) => ({
      ...current,
      [question.id]: [...revealedHints, hintStep],
    }));
    setGuideMessage(`Step 1: ${hintStep}`);
    setFeedback("neutral");
    persistLiveStats({ hintTokens: nextHints });
  };

  const buyShopItem = async (itemType: "health" | "hint" | "skip") => {
    if (!canAct) return;
    const cost = itemType === "skip" ? 20 : 10;

    if (coins < cost) {
      toast.error("Not enough coins.");
      return;
    }

    if (itemType === "health" && hearts >= maxHearts) {
      toast.error("Your hearts are already full.");
      return;
    }

    try {
      await purchaseShopItem(itemType);
    } catch (error) {
      if (!isBackendCoinMismatch(error)) {
        toast.error(error instanceof Error ? error.message : "Unable to complete purchase.");
        return;
      }
    }

    const nextCoins = coins - cost;
    setCoins(nextCoins);

    if (itemType === "health") {
      const nextHearts = Math.min(hearts + 1, maxHearts);
      setHearts(nextHearts);
      persistLiveStats({ coins: nextCoins, hearts: nextHearts });
      toast.success("Health restored.");
      return;
    }

    if (itemType === "hint") {
      const nextHints = hints + 1;
      setHints(nextHints);
      persistLiveStats({ coins: nextCoins, hintTokens: nextHints });
      toast.success("Hint token added.");
      return;
    }

    persistLiveStats({ coins: nextCoins });
    toast.success("Question skipped.");
    setGuideMessage("You spent 20 coins to bypass this rune. No puzzle piece was awarded.");
    advanceToNextQuestion();
  };

  const skipWithCoins = () => {
    void buyShopItem("skip");
  };

  const beginQuest = () => {
    setHearts(maxHearts);
    updateStudentProgress((progress) => ({
      ...progress,
      hearts: maxHearts,
      activeQuestId: module.id,
      modules: {
        ...progress.modules,
        [module.id]: {
          ...progress.modules[module.id],
          relicPieces: progress.modules[module.id].gameCompleted
            ? 0
            : progress.modules[module.id].relicPieces,
          currentQuestionIndex: progress.modules[module.id].gameCompleted
            ? 0
            : progress.modules[module.id].currentQuestionIndex,
          completion: progress.modules[module.id].gameCompleted
            ? 0
            : progress.modules[module.id].completion,
          gameCompleted: false,
          status:
            progress.modules[module.id].status === "completed"
              ? "unlocked"
              : progress.modules[module.id].status,
        },
      },
    }));
    if (moduleProgress?.gameCompleted) {
      setPieces(0);
      setQuestionIndex(0);
      setScore(0);
      setXpEarned(0);
      setCoinsEarned(0);
      setLevelComplete(false);
      setLevelFailed(false);
    }
    setIntroOpen(false);
  };

  const retry = () => {
    setIntroOpen(true);
    setHearts(maxHearts);
    updateStudentProgress((progress) => ({
      ...progress,
      hearts: maxHearts,
      activeQuestId: module.id,
      modules: {
        ...progress.modules,
        [module.id]: {
          ...progress.modules[module.id],
          relicPieces: 0,
          currentQuestionIndex: 0,
          completion: 0,
          gameCompleted: false,
          status:
            progress.modules[module.id].status === "completed"
              ? "unlocked"
              : progress.modules[module.id].status,
        },
      },
    }));
    setScore(0);
    setXpEarned(0);
    setXp(getStudentProgress().xp);
    setCoinsEarned(0);
    setPieces(0);
    setQuestionIndex(0);
    setPicked(null);
    setStatus("idle");
    setStreak(0);
    setFeedback("neutral");
    setLevelComplete(false);
    setLevelFailed(false);
    setGuideMessage(
      "Read the equation like a balanced scale. Choose carefully to recover a relic piece.",
    );
  };

  return (
    <ForestBackground>
      <GameHUD hearts={hearts} xp={xp} coins={coins} score={score} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/student" className="btn-game btn-stone text-sm">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="hud-chip">Objective: collect {module.requiredPieces} relic pieces</div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <section className="space-y-5">
            <EquationCard moduleTitle={module.title} question={question} />
            <AnswerChoices
              choices={question.choices}
              picked={picked}
              status={status}
              onChoose={choose}
            />
            <div className="flex justify-end">
              <button
                onClick={nextQuestion}
                disabled={status === "idle" || levelComplete || levelFailed}
                className="btn-game"
              >
                Next Puzzle <Play className="h-4 w-4" />
              </button>
            </div>
            <GuideDialogueBox
              message={guideMessage}
              feedback={feedback}
              questTitle={module.title}
            />
          </section>

          <aside className="space-y-5">
            <PuzzleProgressBoard pieces={pieces} requiredPieces={module.requiredPieces} />
            <HintPanel
              hints={hints}
              streak={streak}
              canAct={canAct}
              revealedHints={revealedHintsByQuestion[question.id] ?? []}
              onHint={useHint}
              onSkip={skipWithCoins}
            />
            <GameShopPanel
              coins={coins}
              hearts={hearts}
              maxHearts={maxHearts}
              canAct={canAct}
              onBuy={buyShopItem}
            />
          </aside>
        </div>
      </main>

      {introOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="quest-panel max-w-xl p-6 text-center"
          >
            <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
              Level intro
            </p>
            <h2 className="mt-2 font-display text-4xl text-primary glow-text">{module.title}</h2>
            <p className="mt-3 text-stone-foreground/80">
              Restore the relic by collecting {module.requiredPieces} pieces. You have recovered{" "}
              {pieces}. You have 3 hearts and {hints} hints.
            </p>
            <button onClick={beginQuest} className="btn-game mt-6">
              Begin Quest
            </button>
          </motion.div>
        </div>
      ) : null}

      <LevelCompleteModal
        open={levelComplete}
        title="Level Complete"
        score={score}
        xp={xpEarned}
        coins={coinsEarned}
        badge={`${module.title} Relic Keeper`}
      />
      <LevelCompleteModal
        open={levelFailed}
        title="Hearts Depleted"
        score={score}
        xp={xpEarned}
        coins={coinsEarned}
        badge="Try Again Token"
        guideModuleId={module.id}
        onRetry={retry}
      />
    </ForestBackground>
  );
}
