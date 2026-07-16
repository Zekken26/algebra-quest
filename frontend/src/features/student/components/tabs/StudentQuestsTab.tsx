import { Link } from "@tanstack/react-router";
import { BookOpenText, CheckCircle2, Lock, Play } from "lucide-react";
import type { StudentAssignedQuest } from "@/features/student/services/studentService";

type StudentQuestsTabProps = {
  quests: StudentAssignedQuest[];
};

export function StudentQuestsTab({ quests }: StudentQuestsTabProps) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">Class Quests</p>
          <h2 className="font-display text-3xl text-primary">Assigned Quests</h2>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quests.length > 0 ? (
          quests.map((quest) => {
            const questProgress = quest.progress?.[0];
            const completed = quest.status === "completed" || Boolean(questProgress?.questCompleted);
            const locked = quest.status === "locked" || Boolean(quest.locked);
            const guideViewed = !quest.guideId || Boolean(questProgress?.guideViewed);
            const started = Boolean(questProgress?.questUnlocked && !questProgress.questCompleted && questProgress.heartsRemaining > 0);
            return (
              <article key={quest.id} className={`quest-panel p-5 ${locked ? "opacity-70 grayscale-[0.35]" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">Level {quest.levelNumber}</p>
                    <h3 className="mt-1 font-display text-2xl text-primary">{quest.title}</h3>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs ${completed ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : locked ? "border-stone-500/30 bg-stone-900/50 text-stone-400" : "border-primary/20 bg-primary/10 text-primary"}`}>
                    {completed ? "Completed" : locked ? "Locked" : "Available"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-foreground/75">{quest.topic} - {quest.difficulty}</p>
                <div className="mt-4 rounded-xl border border-primary/15 bg-black/20 p-3 text-sm text-stone-foreground/75">
                  <p>Pieces: {questProgress?.puzzlePieces ?? 0}/{quest.requiredPuzzlePieces}</p>
                  <p>Status: {completed ? "Completed" : locked ? "Locked" : started ? "Started" : "Not started"}</p>
                  {locked ? <p className="flex items-center gap-2 text-stone-foreground/70"><Lock className="h-4 w-4" />{quest.lockReason ?? `Complete Level ${quest.requiredLevel ?? quest.levelNumber - 1} first.`}</p> : null}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {locked ? (
                    <>
                      <button type="button" className="btn-game btn-stone text-sm opacity-60" disabled><BookOpenText className="h-4 w-4" /> Guide</button>
                      <button type="button" className="btn-game text-sm opacity-60" disabled><Lock className="h-4 w-4" /> Start Quest</button>
                    </>
                  ) : (
                    <>
                      <Link to="/student/quests/$questId/lesson" params={{ questId: quest.id }} className="btn-game btn-stone text-sm"><BookOpenText className="h-4 w-4" /> {completed ? "View Results" : "Guide"}</Link>
                      <Link to={guideViewed ? "/student/quests/$questId/game" : "/student/quests/$questId/lesson"} params={{ questId: quest.id }} className="btn-game text-sm">
                        {completed ? <CheckCircle2 className="h-4 w-4" /> : guideViewed ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}{" "}
                        {completed ? "View Results" : !guideViewed ? "Read Guide First" : started ? "Continue Quest" : "Start Quest"}
                      </Link>
                    </>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <section className="quest-panel p-5 text-sm text-stone-foreground/75">No published quests yet.</section>
        )}
      </div>
    </section>
  );
}
