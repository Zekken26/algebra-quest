import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ForestBackground } from "@/components/ForestBackground";
import { TeacherSidebar } from "@/features/teacher/components/TeacherSidebar";
import { ROUTES } from "@/shared/constants/routes";
import { clearAuth, getAuth } from "@/shared/services/api";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

function TeacherLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && !getAuth()) {
      navigate({ to: ROUTES.login });
    }
  }, [navigate]);

  const logout = () => {
    clearAuth();
    navigate({ to: ROUTES.login });
  };

  return (
    <ForestBackground allowOverflow>
      <div className="min-h-screen lg:flex">
        <TeacherSidebar onLogout={logout} />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </ForestBackground>
  );
}
