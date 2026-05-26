import { motion } from "framer-motion";
import type { AnalyticsPoint } from "@/features/teacher/types/teacher.types";

type PerformanceChartProps = {
  data: AnalyticsPoint[];
  title?: string;
};

export function PerformanceChart({ data, title = "Performance Overview" }: PerformanceChartProps) {
  return (
    <section className="teacher-card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg text-primary sm:text-xl">{title}</h2>
        <span className="text-xs text-stone-foreground/60">Completion vs accuracy</span>
      </div>
      <div className="flex h-56 items-end gap-2 sm:h-64 sm:gap-3">
        {data.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end gap-1 rounded-xl bg-black/20 p-1.5 sm:h-52 sm:p-2">
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
            <span className="text-[0.65rem] text-stone-foreground/65 sm:text-xs">{point.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-foreground/70">
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
