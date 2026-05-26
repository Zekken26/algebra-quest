import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ForestBackground } from "@/components/ForestBackground";
import { TeacherSidebar } from "@/features/teacher/components/TeacherSidebar";
import { resolveAvatarUrl } from "@/features/student/services/studentService";
import { ROUTES } from "@/shared/constants/routes";
import { clearAuth, getAuth } from "@/shared/services/api";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

function TeacherLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getAuth();
  const teacherName = user?.name ?? "Teacher Sage";
  const teacherAvatarUrl = resolveAvatarUrl(user?.avatarUrl);
  const initials = teacherName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (typeof window !== "undefined" && !getAuth()) {
      navigate({ to: ROUTES.login });
    }
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const logout = () => {
    clearAuth();
    navigate({ to: ROUTES.login });
  };

  return (
    <ForestBackground allowOverflow>
      <div className="min-h-screen overflow-x-clip lg:flex">
        <div className="sticky top-0 z-40 flex h-[72px] items-center gap-3 border-b border-primary/15 bg-background/85 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Close teacher navigation" : "Open teacher navigation"}
            aria-expanded={sidebarOpen}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/25 bg-black/30 text-primary shadow-[0_8px_24px_oklch(0_0_0/0.24)] transition hover:bg-primary/10"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base text-primary">Sage Console</p>
            <p className="truncate text-xs text-stone-foreground/65">Algebra Quest LMS</p>
          </div>
          <Link
            to="/teacher/profile"
            className="flex max-w-[46vw] shrink-0 items-center gap-2 rounded-xl border border-primary/20 bg-black/25 px-2 py-1.5 transition hover:bg-primary/10"
            aria-label="Teacher profile"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-primary/10">
              {teacherAvatarUrl ? (
                <img
                  src={teacherAvatarUrl}
                  alt={teacherName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-xs text-primary">{initials}</span>
              )}
            </div>
            <div className="hidden min-w-0 min-[390px]:block">
              <p className="truncate text-xs font-semibold">{teacherName}</p>
              <p className="truncate text-[0.65rem] text-stone-foreground/60">Profile</p>
            </div>
          </Link>
        </div>

        <TeacherSidebar onLogout={logout} />

        <div
          className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!sidebarOpen}
        >
          <button
            type="button"
            aria-label="Close teacher navigation"
            onClick={() => setSidebarOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <TeacherSidebar
            onLogout={logout}
            onNavigate={() => setSidebarOpen(false)}
            onClose={() => setSidebarOpen(false)}
            className={`teacher-sidebar fixed inset-y-0 left-0 z-50 h-dvh w-[min(18rem,85vw)] border-r border-primary/15 bg-background/95 p-4 backdrop-blur-xl transition-transform duration-300 ease-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          />
        </div>

        <main className="mx-auto min-w-0 flex-1 px-4 py-5 sm:px-6 lg:max-w-7xl lg:px-8">
          <Outlet />
        </main>
      </div>
    </ForestBackground>
  );
}
