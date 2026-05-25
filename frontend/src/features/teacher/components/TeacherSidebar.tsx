import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpenText,
  Gauge,
  GraduationCap,
  LogOut,
  Medal,
  UserRound,
  Sparkles,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/teacher", icon: Gauge },
  { label: "Classes", to: "/teacher/classes", icon: Users },
  { label: "Modules", to: "/teacher/modules", icon: BookOpenText },
  { label: "Progress Analytics", to: "/teacher/analytics", icon: BarChart3 },
  { label: "Leaderboard", to: "/teacher/leaderboard", icon: Medal },
  { label: "Profile", to: "/teacher/profile", icon: UserRound },
] as const;

type TeacherSidebarProps = {
  onLogout: () => void;
};

export function TeacherSidebar({ onLogout }: TeacherSidebarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="teacher-sidebar sticky top-0 hidden h-dvh w-72 shrink-0 self-start border-r border-primary/15 bg-background/85 p-4 backdrop-blur-xl lg:block">
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-primary/20 bg-black/20 p-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-gold)] text-gold-foreground">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-lg text-primary">Sage Console</p>
          <p className="text-xs text-stone-foreground/65">Algebra Quest LMS</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/teacher" ? pathname === "/teacher" : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-gold)]"
                  : "text-stone-foreground/80 hover:bg-white/5 hover:text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute inset-x-4 bottom-4 space-y-3">
        <div className="rounded-2xl border border-accent/20 bg-black/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="font-display text-sm">Instructional Insight</span>
          </div>
          <p className="text-xs leading-5 text-stone-foreground/70">
            Four students need support with inverse operations this week.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
