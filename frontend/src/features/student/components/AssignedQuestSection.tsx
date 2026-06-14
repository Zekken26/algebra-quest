import { Link } from "@tanstack/react-router";
import { BookOpenText, CheckCircle2, Lock, Play, Puzzle, Trophy } from "lucide-react";
import type { StudentAssignedQuest } from "@/features/student/services/studentService";

type AssignedQuestSectionProps = {
  quests: StudentAssignedQuest[];
  hasJoinedClass: boolean;
  loading: boolean;
};

export function AssignedQuestSection({
  quests,
  hasJoinedClass,
  loading,
}: AssignedQuestSectionProps) {
  if (loading) {
    return (
      <section className="quest-panel mt-8 p-5 text-sm text-stone-foreground/75">
        Loading quests assigned to your class...
      </section>
    );
  }

  if (!hasJoinedClass) {
    return (
      <section className="quest-panel mt-8 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
              Class Required
            </p>
            <h2 className="mt-1 font-display text-3xl text-primary">
              Join a class first before starting quests.
            </h2>
            <p className="mt-2 text-sm text-stone-foreground/75">
              Your teacher will share a class code. Once you join, assigned quests appear here.
            </p>
          </div>
          <Link to="/student/join-class" className="btn-game text-sm">
            Join Class
          </Link>
        </div>
      </section>
    );
  }

  if (quests.length === 0) {
    return (
      <section className="quest-panel mt-8 p-5">
        <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
          Assigned Quests
        </p>
        <h2 className="mt-1 font-display text-3xl text-primary">No quests assigned yet</h2>
        <p className="mt-2 text-sm text-stone-foreground/75">
          You have joined a class. Published quests from that class will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
            Assigned quests
          </p>
          <h2 className="font-display text-3xl text-primary">Choose Your Quest</h2>
        </div>
        <p className="text-sm text-stone-foreground/70">
          Only quests assigned to your joined class are shown.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quests.map((quest) => {
          const progress = quest.progress?.[0];
          const guideViewed = !quest.guideId || Boolean(progress?.guideViewed);
          const completed = quest.status === "completed" || Boolean(progress?.questCompleted);
          const locked = quest.status === "locked" || Boolean(quest.locked);
          const started = Boolean(
            progress?.questUnlocked && !progress.questCompleted && progress.heartsRemaining > 0,
          );
          const pieces = progress?.puzzlePieces ?? 0;

          return (
            <article
              key={quest.id}
              className={`quest-panel overflow-hidden ${locked ? "opacity-70 grayscale-[0.35]" : ""}`}
            >
              <div
                className={`h-2 ${completed ? "bg-emerald-500" : locked ? "bg-stone-700" : "bg-[var(--gradient-gold)]"}`}
              />
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
                      Level {quest.levelNumber}
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-primary">{quest.title}</h3>
                    <p className="text-sm text-stone-foreground/75">
                      {quest.section?.name ?? quest.topic}
                    </p>
                  </div>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/30 bg-black/20 text-primary">
                    {completed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    ) : locked ? (
                      <Lock className="h-5 w-5 text-stone-400" />
                    ) : guideViewed ? (
                      <Puzzle className="h-6 w-6" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                </div>

                <p className="min-h-12 text-sm leading-6 text-stone-foreground/80">
                  {quest.worldName} - {quest.topic} - {quest.difficulty}
                </p>

                <div className="mt-5 rounded-2xl border border-primary/20 bg-black/20 p-4 text-sm text-stone-foreground/75">
                  <p>
                    Relic pieces: {Math.min(quest.requiredPuzzlePieces, pieces)}/
                    {quest.requiredPuzzlePieces}
                  </p>
                  <p>Questions: {quest._count?.questions ?? quest.questions?.length ?? 0}</p>
                  <p>
                    Status:{" "}
                    {completed
                      ? "Completed"
                      : locked
                        ? "Locked"
                        : started
                          ? "In progress"
                          : "Available"}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {locked ? (
                    <>
                      <button
                        type="button"
                        className="btn-game btn-stone text-sm opacity-60"
                        disabled
                      >
                        <BookOpenText className="h-4 w-4" /> View Quest
                      </button>
                      <button type="button" className="btn-game text-sm opacity-60" disabled>
                        <Lock className="h-4 w-4" /> Start Quest
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/student/quests/$questId/lesson"
                        params={{ questId: quest.id }}
                        className="btn-game btn-stone text-sm"
                      >
                        <BookOpenText className="h-4 w-4" />{" "}
                        {completed ? "View Results" : "View Quest"}
                      </Link>
                      <Link
                        to={
                          guideViewed
                            ? "/student/quests/$questId/game"
                            : "/student/quests/$questId/lesson"
                        }
                        params={{ questId: quest.id }}
                        className="btn-game text-sm"
                      >
                        {completed ? <Trophy className="h-4 w-4" /> : <Play className="h-4 w-4" />}{" "}
                        {completed ? "View Results" : started ? "Continue Quest" : "Start Quest"}
                      </Link>
                    </>
                  )}
                </div>

                {locked ? (
                  <p className="mt-3 text-xs text-stone-foreground/70">
                    {quest.lockReason ??
                      `Complete Level ${quest.requiredLevel ?? quest.levelNumber - 1} first.`}
                  </p>
                ) : !guideViewed ? (
                  <p className="mt-3 text-xs text-stone-foreground/60">
                    Review the Quest Guide first.
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
