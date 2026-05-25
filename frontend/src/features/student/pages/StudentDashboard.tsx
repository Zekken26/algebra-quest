import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Plus, School, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { AssignedQuestSection } from "@/features/student/components/AssignedQuestSection";
import { ProgressSummaryCard } from "@/features/student/components/ProgressSummaryCard";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import { useStudentData } from "@/features/student/hooks/useStudentData";
import {
  fetchStudentAssignedQuests,
  fetchStudentDashboard,
  fetchStudentEnrollmentStatus,
  getStudentProgress,
  toStudentProgressFromDashboard,
  type StudentAssignedQuest,
  type StudentEnrollmentStatus,
} from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";
import { ROUTES } from "@/shared/constants/routes";
import { getAuth } from "@/shared/services/api";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { modules, progress: localProgress } = useStudentData();
  const [progress, setProgress] = useState<StudentProgress>(() => getStudentProgress());
  const [completedQuests, setCompletedQuests] = useState(0);
  const [totalQuests, setTotalQuests] = useState(modules.length);
  const [enrollment, setEnrollment] = useState<StudentEnrollmentStatus | null>(null);
  const [assignedQuests, setAssignedQuests] = useState<StudentAssignedQuest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !getAuth()) {
      navigate({ to: ROUTES.login });
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const loadQuests = async () => {
      setLoadingQuests(true);
      try {
        const dashboard = await fetchStudentDashboard();
        const status = dashboard.enrollment ?? (await fetchStudentEnrollmentStatus());
        if (!mounted) return;
        setProgress(toStudentProgressFromDashboard(dashboard, localProgress));
        setCompletedQuests(dashboard.stats.completedQuests);
        setTotalQuests(
          Math.max(dashboard.stats.completedQuests + dashboard.stats.activeQuests, modules.length),
        );
        setEnrollment(status);

        if (!status.hasJoinedClass) {
          setAssignedQuests([]);
          return;
        }

        const quests = await fetchStudentAssignedQuests();
        if (mounted) setAssignedQuests(quests);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load assigned quests.");
      } finally {
        if (mounted) setLoadingQuests(false);
      }
    };

    void loadQuests();

    return () => {
      mounted = false;
    };
  }, []);

  const hasJoinedClass = Boolean(enrollment?.hasJoinedClass);

  return (
    <ForestBackground>
      <StudentNavbar progress={progress} />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="quest-hero mb-6 overflow-hidden p-6 sm:p-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-black/25 px-3 py-1 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                Student Dashboard
              </div>
              <h1 className="font-display text-4xl text-primary glow-text sm:text-6xl">
                Welcome back, adventurer
              </h1>
              <p className="mt-3 max-w-xl text-stone-foreground/80">
                Review a short quest guide, start the adventure, solve algebra challenges, and
                collect puzzle pieces to unlock each gate.
              </p>
            </div>
            <div className="grid h-28 w-28 place-items-center rounded-3xl border border-primary/30 bg-black/25 shadow-[var(--shadow-glow-gold)]">
              <Compass className="h-14 w-14 text-primary" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-game text-sm"
              onClick={() => navigate({ to: "/student/join-class" })}
            >
              <Plus className="h-4 w-4" /> Join Class
            </button>
          </div>
        </motion.section>

        <ProgressSummaryCard
          progress={progress}
          completedModules={completedQuests}
          totalModules={totalQuests}
        />

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
                My Classes
              </p>
              <h2 className="font-display text-3xl text-primary glow-text">Choose a Class</h2>
            </div>
            <button
              type="button"
              className="btn-game text-sm"
              onClick={() => navigate({ to: "/student/join-class" })}
            >
              <Plus className="h-4 w-4" /> Join Class
            </button>
          </div>

          {enrollment?.sections.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {enrollment.sections.map((classItem) => (
                <article key={classItem.id} className="quest-panel p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
                        Code {classItem.code}
                      </p>
                      <h3 className="mt-1 font-display text-2xl text-primary">{classItem.name}</h3>
                      <p className="text-sm text-stone-foreground/70">
                        Teacher: {classItem.teacher?.name ?? "Teacher"}
                      </p>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/30 bg-black/20 text-primary">
                      <School className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-black/20 p-3">
                      <p className="font-display text-xl text-primary">
                        {classItem._count?.questGuides ?? 0}
                      </p>
                      <p className="text-xs text-stone-foreground/60">Guides</p>
                    </div>
                    <div className="rounded-xl bg-black/20 p-3">
                      <p className="font-display text-xl text-primary">
                        {classItem._count?.quests ?? 0}
                      </p>
                      <p className="text-xs text-stone-foreground/60">Quests</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-game mt-5 w-full text-sm"
                    onClick={() =>
                      navigate({
                        to: "/student/classes/$classId",
                        params: { classId: classItem.id },
                      })
                    }
                  >
                    Open Class <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <section className="quest-panel p-5">
              <h3 className="font-display text-2xl text-primary">No classes yet</h3>
              <p className="mt-2 text-sm text-stone-foreground/75">
                Enter a class code from your teacher to unlock class-specific quests.
              </p>
            </section>
          )}
        </section>

        <AssignedQuestSection
          quests={assignedQuests}
          hasJoinedClass={hasJoinedClass}
          loading={loadingQuests}
        />
      </main>
    </ForestBackground>
  );
}
