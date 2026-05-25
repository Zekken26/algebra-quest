import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type KPIStatCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
};

export function KPIStatCard({ label, value, detail, icon: Icon }: KPIStatCardProps) {
  return (
    <motion.article whileHover={{ y: -4 }} className="teacher-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-xs text-accent">
          Live
        </span>
      </div>
      <p className="text-sm text-stone-foreground/70">{label}</p>
      <p className="mt-1 font-display text-3xl text-primary">{value}</p>
      <p className="mt-2 text-xs text-stone-foreground/60">{detail}</p>
    </motion.article>
  );
}
