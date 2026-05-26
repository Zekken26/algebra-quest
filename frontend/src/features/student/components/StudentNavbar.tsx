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
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:px-5 sm:py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/50 bg-black/25 shadow-[0_0_24px_oklch(0.82_0.17_80/0.32)] sm:h-12 sm:w-12 sm:shadow-[var(--shadow-glow-gold)]">
              <img
                src="/algebra-quest-logo.png"
                alt="Algebra Quest logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base text-primary glow-text sm:text-xl">
                Algebra Quest
              </p>
              <p className="truncate text-[0.62rem] uppercase tracking-[0.14em] text-stone-foreground/60 sm:text-xs sm:tracking-[0.18em]">
                Student Portal
              </p>
            </div>
          </div>

          <div ref={containerRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex min-w-0 items-center gap-2 rounded-xl border border-primary/25 bg-black/25 px-2 py-1.5 text-left transition hover:bg-primary/10 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary/40 bg-[var(--gradient-gold)] font-display text-xs text-gold-foreground sm:h-10 sm:w-10 sm:text-sm">
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
              <div className="hidden min-w-0 flex-1 min-[380px]:block sm:flex-none">
                <p className="max-w-24 truncate text-xs font-semibold sm:max-w-40 sm:text-sm">
                  {studentName}
                </p>
                <p className="max-w-24 truncate text-[0.65rem] text-stone-foreground/60 sm:max-w-44 sm:text-xs">
                  {progress.rank || "Apprentice"} - {progress.currentLevel}
                </p>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-primary transition sm:h-4 sm:w-4 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <StudentProfileDropdown open={open} onClose={() => setOpen(false)} />
          </div>
        </div>

        <div className="min-w-0 lg:flex lg:justify-end">
          <HealthStatsBar progress={progress} />
        </div>
      </div>
    </motion.nav>
  );
}
