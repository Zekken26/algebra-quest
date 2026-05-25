import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type GuideDialogueBoxProps = {
  message: string;
  feedback?: "good" | "bad" | "neutral";
  questTitle?: string;
};

export function GuideDialogueBox({
  message,
  feedback = "neutral",
  questTitle,
}: GuideDialogueBoxProps) {
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`quest-panel p-4 ${
        feedback === "good"
          ? "border-success/70"
          : feedback === "bad"
            ? "border-destructive/70"
            : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--gradient-gold)] text-gold-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-sm uppercase tracking-[0.18em] text-primary">
            Wizard Guide{questTitle ? ` - ${questTitle}` : ""}
          </p>
          <p className="mt-1 text-stone-foreground/85">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
