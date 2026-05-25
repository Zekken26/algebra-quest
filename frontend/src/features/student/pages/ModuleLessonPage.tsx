import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ForestBackground } from "@/components/ForestBackground";
import { LessonViewer } from "@/features/student/components/LessonViewer";
import {
  getStudentModule,
  updateStudentProgress,
} from "@/features/student/services/studentService";
import { ROUTES } from "@/shared/constants/routes";
import { getAuth } from "@/shared/services/api";

type ModuleLessonPageProps = {
  moduleId: string;
};

export function ModuleLessonPage({ moduleId }: ModuleLessonPageProps) {
  const navigate = useNavigate();
  const module = getStudentModule(moduleId);

  useEffect(() => {
    if (typeof window !== "undefined" && !getAuth()) {
      navigate({ to: ROUTES.login });
    }
  }, [navigate]);

  useEffect(() => {
    if (!module) return;
    updateStudentProgress((progress) => ({
      ...progress,
      modules: {
        ...progress.modules,
        [module.id]: {
          ...progress.modules[module.id],
          guideViewed: true,
        },
      },
    }));
  }, [module]);

  if (!module) {
    return (
      <ForestBackground>
        <main className="grid min-h-screen place-items-center p-6">
          <div className="quest-panel p-6 text-center">
            <h1 className="font-display text-3xl text-primary">Module not found</h1>
          </div>
        </main>
      </ForestBackground>
    );
  }

  return (
    <ForestBackground>
      <main className="min-h-screen px-4 py-8">
        <LessonViewer module={module} />
      </main>
    </ForestBackground>
  );
}
