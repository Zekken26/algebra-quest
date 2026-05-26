import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpenText, CheckCircle2, Loader2, Lock, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import {
  ApiRequestError,
  fetchStudentAssignedQuest,
  markAssignedQuestGuideRead,
  type StudentAssignedQuest,
} from "@/features/student/services/studentService";

type AssignedQuestGuidePageProps = {
  questId: string;
};

export function AssignedQuestGuidePage({ questId }: AssignedQuestGuidePageProps) {
  const navigate = useNavigate();
  const [quest, setQuest] = useState<StudentAssignedQuest | null>(null);
  const [lockedQuest, setLockedQuest] = useState<{ message: string; requiredLevel?: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadQuest = async () => {
      try {
        const nextQuest = await fetchStudentAssignedQuest(questId);

        if (mounted) setQuest(nextQuest);
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
        toast.error(error instanceof Error ? error.message : "Unable to load quest guide.");
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

  if (loading) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <section className="quest-panel flex items-center gap-2 p-6 text-sm text-stone-foreground/75">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading quest guide...
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

  const guide = quest.guide;
  const progress = quest.progress?.[0] ?? null;
  const guideViewed = !quest.guideId || Boolean(progress?.guideViewed);
  const classId = quest.sectionId ?? quest.section?.id;

  const markGuideRead = async () => {
    setMarkingRead(true);
    try {
      const nextProgress = await markAssignedQuestGuideRead(quest.id, classId);
      setQuest((current) =>
        current
          ? {
              ...current,
              progress: current.progress?.length
                ? current.progress.map((item, index) => (index === 0 ? nextProgress : item))
                : [nextProgress],
            }
          : current,
      );
      toast.success("Guide completed. You may now start the quest.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete guide.");
    } finally {
      setMarkingRead(false);
    }
  };

  const StartQuestButton = ({ mobile = false }: { mobile?: boolean }) => {
    const content = guideViewed ? (
      <>
        <Play className="h-4 w-4" /> Start Quest
      </>
    ) : (
      <>
        <Lock className="h-4 w-4" /> Complete Guide First
      </>
    );

    if (!guideViewed) {
      return (
        <button
          type="button"
          disabled
          title="Complete the guide first."
          className={`btn-game ${mobile ? "w-full" : ""} text-sm`}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        to="/student/quests/$questId/game"
        params={{ questId }}
        className={`btn-game ${mobile ? "w-full" : ""} text-sm`}
      >
        {content}
      </Link>
    );
  };

  return (
    <ForestBackground>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-5 pb-24 sm:py-8 md:pb-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/student" className="btn-game btn-stone text-sm">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="hidden md:block">
            <StartQuestButton />
          </div>
        </div>

        <section className="quest-panel p-4 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
                Assigned to: {quest.section?.name ?? "your class"} - {quest.topic}
              </p>
              <h1 className="mt-2 font-display text-3xl text-primary glow-text sm:text-4xl">
                {guide?.title ?? `${quest.title} Guide`}
              </h1>
              <p className="mt-3 text-stone-foreground/80">
                {guide?.shortExplanation ?? "Review the quest topic before starting."}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-black/20 px-3 py-1.5 text-xs text-stone-foreground/75">
                {guideViewed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-accent" /> Guide Completed
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-primary" />
                    Read and mark this guide as completed to unlock the quest.
                  </>
                )}
              </div>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/30 bg-black/20 text-primary">
              <BookOpenText className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-stone-foreground/60">Example</p>
            <p className="mt-1 font-display text-2xl text-primary">
              {guide?.exampleProblem ?? quest.title}
            </p>
          </div>

          <ol className="mt-5 space-y-3">
            {(guide?.solutionSteps?.length
              ? guide.solutionSteps
              : [
                  "Read each equation carefully.",
                  "Use inverse operations.",
                  "Keep both sides balanced.",
                ]
            ).map((step, index) => (
              <li key={`${step}-${index}`} className="flex gap-3 text-sm text-stone-foreground/85">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-xs text-primary">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {guide?.tips?.length ? (
            <div className="mt-5 rounded-xl border border-accent/20 bg-accent/10 p-4 text-sm text-stone-foreground/80">
              <p className="font-display text-primary">Tips</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {guide.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 border-t border-primary/15 pt-5">
            {guideViewed ? (
              <p className="mb-3 flex items-center gap-2 text-sm text-accent">
                <CheckCircle2 className="h-4 w-4" /> You may now start the quest.
              </p>
            ) : (
              <p className="mb-3 text-sm text-stone-foreground/70">
                Complete the guide check when you are ready. This unlocks the quest.
              </p>
            )}
            <div className="grid gap-3 md:hidden">
              {!guideViewed ? (
                <button
                  type="button"
                  onClick={() => void markGuideRead()}
                  disabled={markingRead}
                  className="btn-game btn-stone w-full text-sm"
                >
                  {markingRead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Mark Guide as Read
                </button>
              ) : null}
              <StartQuestButton mobile />
            </div>
            <div className="hidden items-center justify-between gap-3 md:flex">
              {!guideViewed ? (
                <button
                  type="button"
                  onClick={() => void markGuideRead()}
                  disabled={markingRead}
                  className="btn-game btn-stone text-sm"
                >
                  {markingRead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Mark Guide as Read
                </button>
              ) : null}
              <StartQuestButton />
            </div>
          </div>
        </section>
      </main>
    </ForestBackground>
  );
}
