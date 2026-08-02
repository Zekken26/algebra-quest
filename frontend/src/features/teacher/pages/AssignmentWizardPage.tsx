import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModuleActivityForm } from "@/features/teacher/components/ModuleActivityForm";
import { QuestionBuilder } from "@/features/teacher/components/QuestionBuilder";
import { SettingsPanel, SettingsField } from "@/features/teacher/components/SettingsPanel";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import {
  fetchTeacherSections,
  createAssignment,
  ApiRequestError,
  type TeacherSection,
} from "@/features/teacher/services/teacherService";
import type { QuestionData } from "@/features/teacher/components/QuestionBuilder";

export function AssignmentWizardPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [passingScore, setPassingScore] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    return () => { mounted = false; };
  }, []);

  const goToModules = () => navigate({ to: "/teacher/modules" });

  const handleSaveForm = async (data: {
    title: string;
    description: string | null;
    instructions: string | null;
    dueDate: string | null;
    availableFrom: string | null;
    availableTo: string | null;
    totalPoints: number | null;
    isPublished: boolean;
    sectionIds: string[];
  }) => {
    const nextErrors: Record<string, string> = {};
    if (data.sectionIds.length === 0) nextErrors.sectionIds = "Select at least one class.";
    questions.forEach((question, index) => {
      if (!question.equation.trim()) nextErrors[`questions.${index}.equation`] = "Question content is required.";
      if (!question.correctAnswer.trim()) nextErrors[`questions.${index}.correctAnswer`] = "A correct answer is required.";
    });
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    const baseInput = {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      dueDate: data.dueDate,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      totalPoints: data.totalPoints,
      passingScore: passingScore ? parseInt(passingScore, 10) : null,
      isPublished: data.isPublished,
      questions: questions.map((q) => ({
        equation: q.equation,
        questionType: q.questionType,
        choices: q.questionType === "TRUE_FALSE" ? ["True", "False"] : q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      })),
    };

    try {
      for (const sid of data.sectionIds) {
        await createAssignment({ ...baseInput, sectionId: sid });
      }
      toast.success(data.isPublished ? "Assignment created and published." : "Assignment saved as a draft.");
      goToModules();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.fieldErrors);
        toast.error(error.message);
        return;
      }
      toast.error("Failed to save assignment.");
    }
  };

  if (loading) {
    return (
      <div>
        <TeacherHeader title="Create Assignment" subtitle="Create a new assignment for your classes." />
        <section className="teacher-card p-6 text-sm text-stone-foreground/70">
          Loading...
        </section>
      </div>
    );
  }

  return (
    <div>
      <TeacherHeader title="Create Assignment" subtitle="Create a new assignment for your classes." />
      <ModuleActivityForm
        variant="page"
        title="New Assignment"
        onSave={handleSaveForm}
        onCancel={goToModules}
        fieldErrors={fieldErrors}
        isPublished={isPublished}
        onPublishChange={setIsPublished}
      >
        <SettingsPanel title="Assignment Settings">
          <SettingsField label="Passing Score">
            <input
              type="number"
              className="teacher-input"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              min={0}
              placeholder="Optional"
            />
          </SettingsField>
        </SettingsPanel>

        <div className="mt-4">
          <QuestionBuilder
            questions={questions}
            onChange={(nextQuestions) => {
              setQuestions(nextQuestions);
              setFieldErrors((current) =>
                Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith("questions."))),
              );
            }}
            fieldErrors={fieldErrors}
            allowedTypes={["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "SHORT_ANSWER", "ESSAY"]}
          />
        </div>
      </ModuleActivityForm>
    </div>
  );
}
