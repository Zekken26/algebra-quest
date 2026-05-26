import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpenText, CheckCircle2, Loader2, Lock, Play, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import {
  fetchStudentClass,
  fetchStudentClassLeaderboard,
  fetchStudentClassProgress,
  fetchStudentClassQuestGuides,
  fetchStudentClassQuests,
  fetchStudentDashboard,
  getStudentProgress,
  toStudentProgressFromDashboard,
  type StudentAssignedQuest,
  type StudentClass,
  type StudentClassLeaderboardRow,
  type StudentClassProgress,
  type StudentQuestGuide,
} from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";

type StudentClassPageProps = {
  classId: string;
};

export function StudentClassPage({ classId }: StudentClassPageProps) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<StudentProgress>(() => getStudentProgress());
  const [classInfo, setClassInfo] = useState<StudentClass | null>(null);
  const [guides, setGuides] = useState<StudentQuestGuide[]>([]);
  const [quests, setQuests] = useState<StudentAssignedQuest[]>([]);
  const [classProgress, setClassProgress] = useState<StudentClassProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<StudentClassLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [nextClass, nextGuides, nextQuests, nextProgress, nextLeaderboard, dashboard] =
      await Promise.all([
        fetchStudentClass(classId),
        fetchStudentClassQuestGuides(classId),
        fetchStudentClassQuests(classId),
        fetchStudentClassProgress(classId),
        fetchStudentClassLeaderboard(classId),
        fetchStudentDashboard(),
      ]);
    setProgress(toStudentProgressFromDashboard(dashboard, progress));
    setClassInfo(nextClass);
    setGuides(nextGuides);
    setQuests(nextQuests);
    setClassProgress(nextProgress);
    setLeaderboard(nextLeaderboard);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    load()
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load class.");
        navigate({ to: "/student" });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [classId, navigate]);

  return (
    <ForestBackground>
      <StudentNavbar progress={progress} />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/student" className="btn-game btn-stone mb-5 text-sm">
          <ArrowLeft className="h-4 w-4" /> My Classes
        </Link>

        <section className="quest-hero mb-6 p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
                Class code {classInfo?.code ?? "------"}
              </p>
              <h1 className="mt-2 font-display text-4xl text-primary glow-text sm:text-5xl">
                {classInfo?.name ?? "Class"}
              </h1>
              <p className="mt-3 max-w-2xl text-stone-foreground/80">
                {classInfo?.description ||
                  `Quests, guides, progress, and rankings for ${classInfo?.teacher?.name ?? "this teacher"}.`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat label="Guides" value={String(guides.length)} />
              <Stat label="Quests" value={String(quests.length)} />
              <Stat label="Done" value={String(classProgress?.summary.completedQuests ?? 0)} />
            </div>
          </div>
        </section>

        {loading ? (
          <section className="quest-panel flex items-center gap-2 p-5 text-sm text-stone-foreground/75">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading class...
          </section>
        ) : (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-4">
              <Stat
                label="Completion"
                value={`${Math.round(classProgress?.summary.completionProgress ?? 0)}%`}
              />
              <Stat
                label="Accuracy"
                value={`${Math.round(classProgress?.summary.accuracy ?? 0)}%`}
              />
              <Stat label="XP Earned" value={String(classProgress?.summary.xpEarned ?? 0)} />
              <Stat label="Coins Earned" value={String(classProgress?.summary.coinsEarned ?? 0)} />
            </section>

            <section className="mb-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
                    Quest Guides
                  </p>
                  <h2 className="font-display text-3xl text-primary">Study First</h2>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {guides.length > 0 ? (
                  guides.map((guide) => (
                    <article key={guide.id} className="quest-panel p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
                            {guide.topic}
                          </p>
                          <h3 className="mt-1 font-display text-2xl text-primary">{guide.title}</h3>
                        </div>
                        <BookOpenText className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm leading-6 text-stone-foreground/80">
                        {guide.shortExplanation}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {guide.featuredQuest?.id || guide.quests?.[0]?.id ? (
                          <Link
                            to="/student/quests/$questId/lesson"
                            params={{
                              questId: guide.featuredQuest?.id ?? guide.quests?.[0]?.id ?? "",
                            }}
                            className="btn-game btn-stone text-sm"
                          >
                            <BookOpenText className="h-4 w-4" /> Open Guide
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <section className="quest-panel p-5 text-sm text-stone-foreground/75">
                    No quest guides yet.
                  </section>
                )}
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
                    Class Quests
                  </p>
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
                    const started = Boolean(
                      questProgress?.questUnlocked &&
                        !questProgress.questCompleted &&
                        questProgress.heartsRemaining > 0,
                    );
                    return (
                      <article
                        key={quest.id}
                        className={`quest-panel p-5 ${locked ? "opacity-70 grayscale-[0.35]" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
                              Level {quest.levelNumber}
                            </p>
                            <h3 className="mt-1 font-display text-2xl text-primary">
                              {quest.title}
                            </h3>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              completed
                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                                : locked
                                  ? "border-stone-500/30 bg-stone-900/50 text-stone-400"
                                  : "border-primary/20 bg-primary/10 text-primary"
                            }`}
                          >
                            {completed ? "Completed" : locked ? "Locked" : started ? "Available" : "Available"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-stone-foreground/75">
                          {quest.topic} - {quest.difficulty}
                        </p>
                        <div className="mt-4 rounded-xl border border-primary/15 bg-black/20 p-3 text-sm text-stone-foreground/75">
                          <p>
                            Pieces: {questProgress?.puzzlePieces ?? 0}/{quest.requiredPuzzlePieces}
                          </p>
                          <p>
                            Status:{" "}
                            {completed ? "Completed" : locked ? "Locked" : started ? "Started" : "Not started"}
                          </p>
                          {locked ? (
                            <p className="flex items-center gap-2 text-stone-foreground/70">
                              <Lock className="h-4 w-4" />
                              {quest.lockReason ?? `Complete Level ${quest.requiredLevel ?? quest.levelNumber - 1} first.`}
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {locked ? (
                            <>
                              <button type="button" className="btn-game btn-stone text-sm opacity-60" disabled>
                                <BookOpenText className="h-4 w-4" /> Guide
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
                                {completed ? "View Results" : "Guide"}
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
                                {completed ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : guideViewed ? (
                                  <Play className="h-4 w-4" />
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}{" "}
                                {completed
                                  ? "View Results"
                                  : !guideViewed
                                    ? "Read Guide First"
                                    : started
                                      ? "Continue Quest"
                                      : "Start Quest"}
                              </Link>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <section className="quest-panel p-5 text-sm text-stone-foreground/75">
                    No published quests yet.
                  </section>
                )}
              </div>
            </section>

            <section className="quest-panel overflow-hidden">
              <div className="border-b border-primary/10 p-5">
                <h2 className="font-display text-2xl text-primary">Class Leaderboard</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/20 text-xs uppercase tracking-wide text-stone-foreground/60">
                    <tr>
                      <th className="p-4">Rank</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Completion</th>
                      <th className="p-4">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row) => (
                      <tr key={row.student.id} className="border-t border-primary/10">
                        <td className="p-4 font-display text-primary">#{row.rank}</td>
                        <td className="p-4">
                          {row.rank === 1 ? (
                            <Trophy className="mr-2 inline h-4 w-4 text-primary" />
                          ) : null}
                          {row.student.name}
                        </td>
                        <td className="p-4">{Math.round(row.overallScore)}</td>
                        <td className="p-4">{Math.round(row.completionProgress)}%</td>
                        <td className="p-4">{Math.round(row.accuracy)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </ForestBackground>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-black/20 p-3">
      <p className="font-display text-2xl text-primary">{value}</p>
      <p className="text-xs text-stone-foreground/60">{label}</p>
    </div>
  );
}
