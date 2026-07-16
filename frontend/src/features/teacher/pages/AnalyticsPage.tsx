import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PerformanceChart } from "@/features/teacher/components/PerformanceChart";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { fetchTeacherAnalytics } from "@/features/teacher/services/teacherService";
import type { AnalyticsPoint, WeakTopic } from "@/features/teacher/types/teacher.types";

export function AnalyticsPage() {
  const [points, setPoints] = useState<AnalyticsPoint[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [summary, setSummary] = useState({
    averageTimeSpent: 0,
    accuracy: 0,
    completion: 0,
    totalAttempts: 0,
  });
  const [dateRange, setDateRange] = useState("7d");

  const loadAnalytics = async (range = dateRange) => {
    try {
      const data = await fetchTeacherAnalytics(undefined, range as "7d" | "30d" | "term");
      setPoints(data.points);
      setWeakTopics(data.weakTopics);
      setSummary(data.summary);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load analytics.");
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  return (
    <div>
      <TeacherHeader
        title="Progress Analytics"
        subtitle="Analyze completion, accuracy, time spent, weak topics, and game performance trends."
        actionLabel="Export Report"
        onAction={() => {
          const csv = [
            "Label,Completion,Accuracy,GameScore",
            ...points.map(
              (point) => `${point.label},${point.completion},${point.accuracy},${point.gameScore}`,
            ),
          ].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `analytics-${dateRange}.csv`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Analytics report exported.");
        }}
      />
      <section className="teacher-card mb-6 p-4">
        <label className="grid gap-2 md:max-w-sm">
          <span className="text-sm text-stone-foreground/70">Date range</span>
          <select
            className="teacher-input"
            value={dateRange}
            onChange={(event) => {
              const nextRange = event.target.value;
              setDateRange(nextRange);
              void loadAnalytics(nextRange);
              toast.success("Date range filter applied.");
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="term">Current term</option>
          </select>
        </label>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PerformanceChart data={points} title="Accuracy and Completion Trends" />
        <section className="teacher-card p-5">
          <h2 className="font-display text-xl text-primary">Weak Topic Heatmap</h2>
          <div className="mt-5 space-y-4">
            {weakTopics.map((topic) => (
              <div key={topic.topic}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{topic.topic}</span>
                  <span className="text-stone-foreground/60">
                    {topic.studentsImpacted} students
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-black/25">
                  <div
                    className="h-full rounded-full bg-(--gradient-gold)"
                    style={{ width: `${topic.intensity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="teacher-card p-5">
          <p className="text-sm text-stone-foreground/65">Avg Time Spent</p>
          <p className="font-display text-3xl text-primary">
            {(summary.averageTimeSpent / 3600).toFixed(1)}h
          </p>
        </div>
        <div className="teacher-card p-5">
          <p className="text-sm text-stone-foreground/65">Quiz Accuracy</p>
          <p className="font-display text-3xl text-primary">{Math.round(summary.accuracy)}%</p>
        </div>
        <div className="teacher-card p-5">
          <p className="text-sm text-stone-foreground/65">Game Completion</p>
          <p className="font-display text-3xl text-primary">{Math.round(summary.completion)}%</p>
        </div>
      </section>
    </div>
  );
}
