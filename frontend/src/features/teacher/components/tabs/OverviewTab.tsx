import { BookOpenText, Trophy, Users } from "lucide-react";
import { ActivitySection } from "@/features/teacher/components/ActivitySection";
import { LeaderboardTable } from "@/features/teacher/components/LeaderboardTable";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import type { TeacherClassDetails } from "@/features/teacher/services/teacherService";

type OverviewTabProps = {
  details: TeacherClassDetails | null;
  classId: string;
  currentClassSection: { id: string; name: string; code: string } | null;
  onLoad: () => void;
  onExportCsv: () => void;
  studentsLength: number;
};

function StatCard({
  label,
  value,
  icon,
  danger,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="teacher-card p-4">
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${danger ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}
      >
        {icon}
      </div>
      <p className="text-sm text-stone-foreground/65">{label}</p>
      <p className={`font-display text-2xl ${danger ? "text-destructive" : "text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function AnalyticsLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-black/20 p-3">
      <span className="text-sm text-stone-foreground/70">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}

export function OverviewTab({ details, classId, currentClassSection, onLoad, onExportCsv, studentsLength }: OverviewTabProps) {
  return (
    <div>
      <Link to="/teacher/classes" className="btn-game btn-stone mb-4 text-sm">
        <ArrowLeft className="h-4 w-4" /> Classes
      </Link>

      <TeacherHeader
        title={details?.classInfo.name ?? "Class Details"}
        subtitle="Manage students, assigned quests, class analytics, and leaderboard standings."
      >
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-game btn-stone px-4 py-3 text-sm" onClick={onLoad}>
            <Download className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            className="btn-game px-4 py-3 text-sm"
            onClick={onExportCsv}
            disabled={studentsLength === 0}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </TeacherHeader>

      <section className="teacher-card mb-6 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-display text-3xl text-primary">
              {details?.classInfo.name ?? "Loading..."}
            </h2>
            <p className="mt-2 text-sm text-stone-foreground/75">
              Teacher: {details?.classInfo.teacher.name ?? "Loading"}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={String(details?.analytics.totalStudents ?? 0)} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Average Accuracy" value={`${Math.round(details?.analytics.averageAccuracy ?? 0)}%`} icon={<BookOpenText className="h-5 w-5" />} />
        <StatCard label="Completion Rate" value={`${Math.round(details?.analytics.completionRate ?? 0)}%`} icon={<Trophy className="h-5 w-5" />} />
        <StatCard label="Students At Risk" value={String(details?.analytics.studentsAtRisk ?? 0)} icon={<Users className="h-5 w-5" />} danger />
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ActivitySection classId={classId} currentSection={currentClassSection} onQuestCreated={onLoad} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="teacher-card p-5">
          <h2 className="font-display text-xl text-primary">Class Analytics</h2>
          <div className="mt-4 grid gap-3">
            <AnalyticsLine label="Average Accuracy" value={`${Math.round(details?.analytics.averageAccuracy ?? 0)}%`} />
            <AnalyticsLine label="Completion Rate" value={`${Math.round(details?.analytics.completionRate ?? 0)}%`} />
            <AnalyticsLine label="Students At Risk" value={String(details?.analytics.studentsAtRisk ?? 0)} />
            <AnalyticsLine label="Top Student" value={details?.analytics.topStudent?.student.name ?? "No top student yet"} />
          </div>
        </section>
        <LeaderboardTable
          students={
            details?.leaderboard.map((row) => ({
              id: row.student.id,
              name: row.student.name,
              email: row.student.email,
              classId,
              avatar: row.student.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
              xp: row.student.xp ?? row.xpEarned ?? 0,
              coins: row.student.coins ?? row.coinsEarned ?? 0,
              accuracy: Math.round(row.accuracy),
              completion: Math.round(row.completionProgress),
              quizAverage: Math.round(row.accuracy),
              gameScore: Math.round(row.overallScore),
              timeSpentMinutes: Math.round(row.totalTimeSpent / 60),
              weakAreas: [],
              currentQuest: "",
              status: row.accuracy >= 90 ? "thriving" : row.accuracy < 70 ? "at-risk" : "steady",
            })) ?? []
          }
        />
      </div>
    </div>
  );
}
