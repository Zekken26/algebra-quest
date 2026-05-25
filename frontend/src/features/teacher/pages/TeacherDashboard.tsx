import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BookOpenText, GraduationCap, Percent, Users } from "lucide-react";
import { ActivityFeed } from "@/features/teacher/components/ActivityFeed";
import { KPIStatCard } from "@/features/teacher/components/KPIStatCard";
import { PerformanceChart } from "@/features/teacher/components/PerformanceChart";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { TopStudentCard } from "@/features/teacher/components/TopStudentCard";
import {
  fetchTeacherAnalytics,
  fetchTeacherDashboardStats,
} from "@/features/teacher/services/teacherService";

export function TeacherDashboard() {
  const statsQuery = useQuery({
    queryKey: ["teacher", "dashboard"],
    queryFn: fetchTeacherDashboardStats,
  });
  const analyticsQuery = useQuery({
    queryKey: ["teacher", "analytics", "7d"],
    queryFn: () => fetchTeacherAnalytics(undefined, "7d"),
  });

  const stats = statsQuery.data;
  const chartData = analyticsQuery.data?.points ?? [];
  const loading = statsQuery.isFetching || analyticsQuery.isFetching;

  const refresh = async () => {
    await Promise.all([statsQuery.refetch(), analyticsQuery.refetch()]);
  };

  if (!stats) {
    return (
      <div className="teacher-card p-6">
        {statsQuery.error instanceof Error
          ? statsQuery.error.message
          : "Loading teacher dashboard..."}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <TeacherHeader
        title="Dashboard Overview"
        subtitle="Monitor class health, student mastery, and quest progress from one command center."
      />
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="btn-game btn-stone text-sm"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Analytics"}
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard
          label="Total Classes"
          value={stats.totalClasses}
          detail="Across active cohorts"
          icon={GraduationCap}
        />
        <KPIStatCard
          label="Total Students"
          value={stats.totalStudents}
          detail="Currently enrolled"
          icon={Users}
        />
        <KPIStatCard
          label="Active Modules"
          value={stats.activeModules}
          detail="Published and assignable"
          icon={BookOpenText}
        />
        <KPIStatCard
          label="Avg Performance"
          value={`${stats.averagePerformance}%`}
          detail="Quiz and game blended"
          icon={Percent}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <PerformanceChart data={chartData} />
        <TopStudentCard student={stats.topStudent} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="teacher-card p-5">
          <h2 className="font-display text-xl text-primary">Students Needing Intervention</h2>
          <div className="mt-4 space-y-3">
            {stats.atRiskStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-stone-foreground/70">
                      {student.weakAreas.join(", ")}
                    </p>
                  </div>
                  <span className="font-display text-destructive">{student.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ActivityFeed activities={stats.recentActivity} />
      </section>
    </motion.div>
  );
}
