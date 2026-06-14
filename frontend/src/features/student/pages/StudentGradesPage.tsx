import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  Loader2,
  School,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import {
  fetchStudentClasses,
  fetchStudentDashboard,
  getStudentProgress,
  toStudentProgressFromDashboard,
  PASSING_SCORE,
  type StudentClass,
} from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";

export function StudentGradesPage() {
  const [progress, setProgress] = useState<StudentProgress>(() => getStudentProgress());
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const dashboard = await fetchStudentDashboard();
        const studentClasses = await fetchStudentClasses();

        if (!mounted) return;

        setProgress(toStudentProgressFromDashboard(dashboard));
        setClasses(studentClasses);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load grades.");
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
      <StudentNavbar progress={progress} />
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            to="/student"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-black/30 px-4 py-2 text-sm font-medium text-stone-foreground/80 transition hover:bg-primary/15 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="quest-hero mb-8 overflow-hidden p-6 sm:p-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-black/25 px-3 py-1 text-sm text-primary">
                <GraduationCap className="h-4 w-4" />
                Report Card & Grades
              </div>
              <h1 className="font-display text-4xl text-primary glow-text sm:text-5xl">
                Class Ledger
              </h1>
              <p className="mt-2 text-stone-foreground/80">
                Track your academic standing, final grades, and class completions assigned by your
                teachers.
              </p>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-2xl border border-primary/30 bg-black/25 shadow-[var(--shadow-glow-gold)]">
              <Award className="h-10 w-10 text-primary" />
            </div>
          </div>
        </motion.section>

        {/* Grades Content */}
        <div className="quest-panel p-5 sm:p-6">
          <div className="mb-6 border-b border-primary/20 pb-4">
            <h2 className="font-display text-2xl text-primary">Class Performance</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-foreground/75">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium">Opening grade scroll...</p>
            </div>
          ) : classes.length > 0 ? (
            <div className="grid gap-6">
              {classes.map((classItem, index) => {
                const hasGrade = classItem.grade !== undefined && classItem.grade !== null;
                const gradeVal = classItem.grade ?? 0;
                const isPassed = gradeVal >= PASSING_SCORE;

                return (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/25 p-5 transition hover:border-primary/30 hover:bg-black/35 sm:p-6"
                  >
                    {/* Decorative gold highlight for high grades */}
                    {hasGrade && gradeVal >= 90 && (
                      <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                        <div className="absolute top-[-5px] right-[-30px] rotate-45 bg-[var(--gradient-gold)] py-1 text-center text-[10px] font-bold text-gold-foreground uppercase tracking-wider w-24 border-b border-gold-foreground/20 shadow-sm">
                          Elite
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                      {/* Left: Class Information */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              Code: {classItem.code}
                            </span>
                            {hasGrade && (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
                                  isPassed
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-rose-500/10 text-rose-400"
                                }`}
                              >
                                {isPassed ? "Passing" : "Incomplete"}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 font-display text-2xl text-primary font-semibold">
                            {classItem.name}
                          </h3>
                          {classItem.description && (
                            <p className="mt-1 text-sm text-stone-foreground/70 line-clamp-2 max-w-xl">
                              {classItem.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-foreground/60">
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-primary/75" />
                            <span>Teacher: {classItem.teacher?.name ?? "Assigned Instructor"}</span>
                          </div>
                          {classItem.joinedAt && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-primary/75" />
                              <span>
                                Enrolled: {new Date(classItem.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Grade Badge */}
                      <div className="flex shrink-0 items-center justify-start md:justify-end">
                        {hasGrade ? (
                          <div className="flex items-center gap-4">
                            <div className="text-left md:text-right">
                              <p className="text-xs uppercase tracking-wider text-stone-foreground/50">
                                Grade Assigned
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  isPassed ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isPassed ? "Passed Class" : "Below Passing (70%)"}
                              </p>
                            </div>
                            <div
                              className={`grid h-20 w-20 place-items-center rounded-2xl border-2 font-display text-2xl font-bold shadow-lg ${
                                isPassed
                                  ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400 shadow-emerald-950/40"
                                  : "border-rose-500/30 bg-rose-950/20 text-rose-400 shadow-rose-950/40"
                              }`}
                            >
                              {Math.round(gradeVal)}%
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="text-left md:text-right">
                              <p className="text-xs uppercase tracking-wider text-stone-foreground/50">
                                Grade Assigned
                              </p>
                              <p className="text-sm font-semibold text-stone-foreground/60">
                                Pending Grading
                              </p>
                            </div>
                            <div className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-stone-700 bg-stone-900/40 font-display text-lg font-bold text-stone-400 shadow-inner">
                              --
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <School className="h-12 w-12 text-stone-600 mb-4" />
              <h3 className="font-display text-xl text-primary">No Enrolled Classes</h3>
              <p className="mt-2 text-sm text-stone-foreground/70 max-w-sm">
                You are not currently enrolled in any class sections. Join a class section using a
                code from your teacher to see your grades here.
              </p>
              <Link to="/student/join-class" className="btn-game mt-6 text-sm">
                Join a Class
              </Link>
            </div>
          )}
        </div>
      </main>
    </ForestBackground>
  );
}
