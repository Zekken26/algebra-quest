import { Bell, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAuth, resolveAvatarUrl } from "@/lib/store";

type TeacherHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function TeacherHeader({ title, subtitle, actionLabel, onAction }: TeacherHeaderProps) {
  const [user, setUser] = useState<ReturnType<typeof getAuth>>(null);
  const teacherName = user?.name ?? "Teacher Sage";
  const teacherAvatarUrl = resolveAvatarUrl(user?.avatarUrl);
  const initials = teacherName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setUser(getAuth());
  }, []);

  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-black/20 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.24em] text-accent">
          Teacher Workspace
        </p>
        <h1 className="mt-1 font-display text-3xl text-primary glow-text md:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-stone-foreground/70">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-foreground/45" />
          <input
            aria-label="Search teacher dashboard"
            placeholder="Search classes, students..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                toast.info(`Search submitted for "${event.currentTarget.value}".`);
              }
            }}
            className="h-11 w-full rounded-xl border border-primary/20 bg-black/25 pl-9 pr-3 text-sm outline-none ring-primary/40 transition focus:ring-2 md:w-64"
          />
        </label>
        <button
          type="button"
          onClick={() => toast.info("No new teacher notifications.")}
          className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-black/25 text-primary transition hover:bg-white/5"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        {onAction && actionLabel ? (
          <button onClick={onAction} className="btn-game text-sm" type="button">
            <Plus className="h-4 w-4" /> {actionLabel}
          </button>
        ) : null}
        <div className="hidden items-center gap-3 rounded-xl border border-primary/20 bg-black/25 px-3 py-2 sm:flex">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/25 bg-primary/10">
            {teacherAvatarUrl ? (
              <img
                src={teacherAvatarUrl}
                alt={teacherName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-sm text-primary">{initials}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">{teacherName}</p>
            <p className="text-xs text-stone-foreground/60">Algebra Faculty</p>
          </div>
        </div>
      </div>
    </header>
  );
}
