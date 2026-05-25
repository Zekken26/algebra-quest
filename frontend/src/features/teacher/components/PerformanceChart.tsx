import { motion } from "framer-motion";
import type { AnalyticsPoint } from "@/features/teacher/types/teacher.types";

type PerformanceChartProps = {
  data: AnalyticsPoint[];
  title?: string;
};

export function PerformanceChart({ data, title = "Performance Overview" }: PerformanceChartProps) {
  return (
    <section className="teacher-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl text-primary">{title}</h2>
        <span className="text-xs text-stone-foreground/60">Completion vs accuracy</span>
      </div>
      <div className="flex h-64 items-end gap-3">
        {data.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-52 w-full items-end gap-1 rounded-xl bg-black/20 p-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${point.completion}%` }}
                className="flex-1 rounded-t-md bg-primary/80"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${point.accuracy}%` }}
                className="flex-1 rounded-t-md bg-accent/80"
              />
            </div>
            <span className="text-xs text-stone-foreground/65">{point.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-xs text-stone-foreground/70">
        <span>
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
          Completion
        </span>
        <span>
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
          Accuracy
        </span>
      </div>
    </section>
  );
}
