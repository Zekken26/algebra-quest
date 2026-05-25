import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchStudentEnrollmentStatus } from "@/features/student/services/studentService";
import { getAuth } from "@/shared/services/api";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [{ name: "title", content: "Student | Algebra Quest Forge" }],
  }),
  component: StudentLayout,
});

function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    let mounted = true;
    const path = location.pathname;
    const isJoinClassPage = path === "/student/join-class";
    const isLegacyModulePath = path.startsWith("/student/modules");
    const requiresClass =
      isLegacyModulePath ||
      path.startsWith("/student/classes") ||
      path.startsWith("/student/quests") ||
      path.startsWith("/student/progress");

    const checkAccess = async () => {
      const auth = getAuth();

      if (!auth) {
        navigate({ to: "/login" });
        return;
      }

      if (auth.role !== "student") {
        navigate({ to: "/teacher" });
        return;
      }

      if (!requiresClass && !isJoinClassPage) {
        if (mounted) setCheckingAccess(false);
        return;
      }

      try {
        const enrollment = await fetchStudentEnrollmentStatus();

        if (!enrollment.hasJoinedClass && requiresClass) {
          navigate({ to: "/student/join-class" });
          return;
        }

        if (enrollment.hasJoinedClass && isLegacyModulePath) {
          navigate({ to: "/student" });
          return;
        }
      } finally {
        if (mounted) setCheckingAccess(false);
      }
    };

    setCheckingAccess(true);
    void checkAccess();

    return () => {
      mounted = false;
    };
  }, [location.pathname, navigate]);

  if (checkingAccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <section className="quest-panel p-6 text-center text-sm text-stone-foreground/70">
          Checking student access...
        </section>
      </main>
    );
  }

  return <Outlet />;
}
