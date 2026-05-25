import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { ProgressSummaryCard } from "@/features/student/components/ProgressSummaryCard";
import {
  fetchStudentClasses,
  fetchStudentClassProgress,
  fetchStudentDashboard,
  getStudentProgress,
  toStudentProgressFromDashboard,
  type StudentClass,
  type StudentClassProgress,
} from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";

export function StudentProgressPage() {
  const [progress, setProgress] = useState<StudentProgress>(() => getStudentProgress());
  const [classes, setClasses] = useState<
    Array<{ classInfo: StudentClass; progress: StudentClassProgress }>
  >([]);
  const [completedQuests, setCompletedQuests] = useState(0);
  const [totalQuests, setTotalQuests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const dashboard = await fetchStudentDashboard();
        const studentClasses = await fetchStudentClasses();
        const classProgress = await Promise.all(
          studentClasses.map(async (classInfo) => ({
            classInfo,
            progress: await fetchStudentClassProgress(classInfo.id),
          })),
        );

        if (!mounted) return;

        setProgress(toStudentProgressFromDashboard(dashboard));
        setClasses(classProgress);
        setCompletedQuests(
          classProgress.reduce((sum, item) => sum + item.progress.summary.completedQuests, 0),
        );
        setTotalQuests(
          classProgress.reduce((sum, item) => sum + item.progress.summary.totalQuests, 0),
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load progress.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ForestBackground>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
        <ProgressSummaryCard
          progress={progress}
          completedModules={completedQuests}
          totalModules={Math.max(totalQuests, 1)}
        />
        <div className="quest-panel mt-6 p-5">
          <h1 className="font-display text-3xl text-primary">Progress Ledger</h1>

          {loading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-stone-foreground/75">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading progress...
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <section
                    key={classItem.classInfo.id}
                    className="rounded-2xl border border-primary/20 bg-black/20 p-4"
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl text-primary">
                          {classItem.classInfo.name}
                        </p>
                        <p className="text-sm text-stone-foreground/70">
                          {classItem.progress.summary.completedQuests}/
                          {classItem.progress.summary.totalQuests} quests completed
                        </p>
                      </div>
                      <p className="font-display text-primary">
                        {Math.round(classItem.progress.summary.completionProgress)}%
                      </p>
                    </div>
                    <div className="grid gap-3">
                      {classItem.progress.quests.map(({ quest, progress: questProgress }) => (
                        <div
                          key={quest.id}
                          className="rounded-xl border border-primary/15 bg-black/20 p-3"
                        >
                          <div className="flex flex-wrap justify-between gap-3">
                            <div>
                              <p className="font-display text-lg text-primary">{quest.title}</p>
                              <p className="text-sm text-stone-foreground/70">{quest.topic}</p>
                              <p className="mt-1 text-sm text-stone-foreground/70">
                                Puzzle pieces: {questProgress?.puzzlePieces ?? 0}/
                                {quest.requiredPuzzlePieces}
                              </p>
                            </div>
                            <div className="text-right text-sm text-stone-foreground/75">
                              <p>
                                {questProgress?.questCompleted
                                  ? "Completed"
                                  : questProgress?.questUnlocked
                                    ? "In progress"
                                    : "Not started"}
                              </p>
                              <p>{Math.round(questProgress?.accuracy ?? 0)}% accuracy</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <p className="text-sm text-stone-foreground/75">
                  Join a class to start tracking class quest progress.
                </p>
              )}
            </div>
          )}

          <Link to="/student" className="btn-game mt-6">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </ForestBackground>
  );
}
