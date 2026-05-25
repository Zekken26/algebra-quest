import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateQuestWizard } from "@/features/teacher/components/CreateQuestWizard";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import {
  fetchTeacherSections,
  type TeacherSection,
} from "@/features/teacher/services/teacherService";

export function CreateQuestPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTeacherSections()
      .then((nextSections) => {
        if (mounted) setSections(nextSections);
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Unable to load sections."),
      )
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const goToModules = () => navigate({ to: "/teacher/modules" });

  return (
    <div>
      <TeacherHeader
        title="Create Quest"
        subtitle="Build a complete class quest with guide notes, game settings, and publish-ready questions."
      />

      {loading ? (
        <section className="teacher-card p-6 text-sm text-stone-foreground/70">
          Loading quest forge...
        </section>
      ) : (
        <CreateQuestWizard sections={sections} onCancel={goToModules} onComplete={goToModules} />
      )}
    </div>
  );
}
