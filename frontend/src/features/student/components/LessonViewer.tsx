import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, CheckCircle2 } from "lucide-react";
import type { StudentModule } from "@/features/student/types/student.types";

type LessonViewerProps = {
  module: StudentModule;
};

function getQuestImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(
    /\/api$/,
    "",
  );
  return `${baseUrl}${url}`;
}

export function LessonViewer({ module }: LessonViewerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl"
    >
      <div className="quest-panel p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
              Quest Guide • {module.topic}
            </p>
            <h1 className="mt-2 font-display text-3xl text-primary glow-text sm:text-5xl">
              {module.lesson.guideTitle ?? module.lesson.title}
            </h1>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/30 bg-black/20">
            <BookOpenText className="h-8 w-8 text-primary" />
          </div>
        </div>

        {module.lesson.imageUrl ? (
          <div className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-black/20 p-2">
            <img
              src={getQuestImageUrl(module.lesson.imageUrl)}
              alt="Guide Reference"
              className="mx-auto max-h-96 w-full object-contain rounded-xl"
            />
          </div>
        ) : null}

        {module.lesson.summary ? (
          <div className="panel-parchment p-5 text-lg leading-8">{module.lesson.summary}</div>
        ) : null}

        {module.lesson.example ? (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-black/20 p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-stone-foreground/60">
              Example Problem
            </p>
            <p className="mt-2 font-display text-5xl text-primary glow-text">
              {module.lesson.example}
            </p>
          </div>
        ) : null}

        {module.lesson.steps && module.lesson.steps.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {module.lesson.steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex gap-3 rounded-2xl border border-primary/20 bg-black/20 p-4"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                <p className="text-stone-foreground/90">{step}</p>
              </motion.div>
            ))}
          </div>
        ) : null}

        {module.lesson.tip ? (
          <p className="mt-6 rounded-2xl border border-accent/20 bg-accent/10 p-4 text-stone-foreground/85">
            Tip: {module.lesson.tip}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Link to="/student" className="btn-game btn-stone">
            Back to Dashboard
          </Link>
          <Link
            to="/student/modules/$moduleId/game"
            params={{ moduleId: module.id }}
            className="btn-game"
          >
            Start Quest <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
