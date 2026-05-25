import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HealthStatsBar } from "@/features/student/components/HealthStatsBar";
import { StudentProfileDropdown } from "@/features/student/components/StudentProfileDropdown";
import { resolveAvatarUrl } from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";
import { getAuth } from "@/shared/services/api";

type StudentNavbarProps = {
  progress: StudentProgress;
};

export function StudentNavbar({ progress }: StudentNavbarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = getAuth();
  const studentName = user?.name || "Algebra Adventurer";
  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-primary/25 bg-[oklch(0.18_0.04_165/0.78)] backdrop-blur-xl shadow-[0_12px_40px_oklch(0_0_0/0.28)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-primary/50 bg-black/25 shadow-[var(--shadow-glow-gold)]">
              <img
                src="/algebra-quest-logo.png"
                alt="Algebra Quest logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-display text-xl text-primary glow-text">Algebra Quest</p>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-foreground/60">
                Student Portal
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <HealthStatsBar progress={progress} />
          <div ref={containerRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex w-full items-center gap-3 rounded-2xl border border-primary/25 bg-black/25 px-3 py-2 text-left transition hover:bg-primary/10 sm:w-auto"
            >
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-primary/40 bg-[var(--gradient-gold)] font-display text-sm text-gold-foreground">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${studentName}'s avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  studentName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1 sm:flex-none">
                <p className="truncate text-sm font-semibold">{studentName}</p>
                <p className="truncate text-xs text-stone-foreground/60">
                  {progress.rank || "Apprentice"} • {progress.currentLevel}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-primary transition ${open ? "rotate-180" : ""}`}
              />
            </button>
            <StudentProfileDropdown open={open} onClose={() => setOpen(false)} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
