import { motion } from "framer-motion";
import type { AlgebraQuestion } from "@/features/student/types/student.types";
import { MathRenderer } from "@/shared/components/MathRenderer";

type EquationCardProps = {
  moduleTitle: string;
  question: AlgebraQuestion;
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

export function EquationCard({ moduleTitle, question }: EquationCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="quest-panel overflow-hidden"
    >
      <div className="border-b border-primary/20 bg-black/20 px-5 py-4">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-accent">
          {moduleTitle}
        </p>
        <h1 className="font-display text-2xl text-primary sm:text-3xl">Equation Challenge</h1>
      </div>
      <div className="relative p-8 text-center sm:p-12">
        <div className="absolute inset-x-10 top-8 h-24 rounded-full bg-primary/10 blur-3xl" />
        {question.imageUrl ? (
          <div className="relative mx-auto mb-6 max-w-md overflow-hidden rounded-xl border border-primary/20 bg-black/35 p-2">
            <img
              src={getQuestImageUrl(question.imageUrl)}
              alt="Question Challenge Reference"
              className="mx-auto max-h-72 w-full object-contain rounded-lg"
            />
          </div>
        ) : null}
        {question.prompt ? (
        <MathRenderer
          latex={question.prompt}
          displayMode
          className="relative text-2xl text-primary glow-text sm:text-4xl"
        />
        ) : null}
      </div>
    </motion.div>
  );
}
