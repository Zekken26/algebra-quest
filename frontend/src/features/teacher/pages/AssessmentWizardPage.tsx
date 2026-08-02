import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModuleActivityForm } from "@/features/teacher/components/ModuleActivityForm";
import { QuestionBuilder } from "@/features/teacher/components/QuestionBuilder";
import { SettingsPanel, SettingsField, ToggleField } from "@/features/teacher/components/SettingsPanel";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import {
  fetchTeacherSections,
  createAssessment,
  ApiRequestError,
  type TeacherSection,
} from "@/features/teacher/services/teacherService";
import type { QuestionData } from "@/features/teacher/components/QuestionBuilder";

export function AssessmentWizardPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [timeLimit, setTimeLimit] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [attemptsAllowed, setAttemptsAllowed] = useState("1");
  const [autoGrade, setAutoGrade] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleChoices, setShuffleChoices] = useState(false);
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
      timeLimitMinutes: timeLimit ? parseInt(timeLimit, 10) : null,
      passingScore: passingScore ? parseInt(passingScore, 10) : null,
      attemptsAllowed: parseInt(attemptsAllowed, 10) || 1,
      autoGrade,
      shuffleQuestions,
      shuffleChoices,
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
        await createAssessment({ ...baseInput, sectionId: sid });
      }
      toast.success(data.isPublished ? "Assessment created and published." : "Assessment saved as a draft.");
      goToModules();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.fieldErrors);
        toast.error(error.message);
        return;
      }
      toast.error("Failed to save assessment.");
    }
  };

  if (loading) {
    return (
      <div>
        <TeacherHeader title="Create Assessment" subtitle="Create a new assessment for your classes." />
        <section className="teacher-card p-6 text-sm text-stone-foreground/70">
          Loading...
        </section>
      </div>
    );
  }

  return (
    <div>
      <TeacherHeader title="Create Assessment" subtitle="Create a new assessment for your classes." />
      <ModuleActivityForm
        variant="page"
        title="New Assessment"
        onSave={handleSaveForm}
        onCancel={goToModules}
        fieldErrors={fieldErrors}
        isPublished={isPublished}
        onPublishChange={setIsPublished}
      >
        <SettingsPanel title="Assessment Settings">
          <SettingsField label="Time Limit (minutes)">
            <input
              type="number"
              className="teacher-input"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              min={1}
              placeholder="Optional"
            />
          </SettingsField>
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
          <SettingsField label="Attempts Allowed">
            <input
              type="number"
              className="teacher-input"
              value={attemptsAllowed}
              onChange={(e) => setAttemptsAllowed(e.target.value)}
              min={1}
            />
          </SettingsField>
          <SettingsField label="" fullWidth>
            <div className="grid gap-2 sm:grid-cols-2">
              <ToggleField label="Auto-Grade" checked={autoGrade} onChange={setAutoGrade} />
              <ToggleField label="Shuffle Questions" checked={shuffleQuestions} onChange={setShuffleQuestions} />
              <ToggleField label="Shuffle Choices" checked={shuffleChoices} onChange={setShuffleChoices} />
            </div>
          </SettingsField>
        </SettingsPanel>

        <div className="mt-4">
          <QuestionBuilder
            questions={questions}
            onChange={(nextQuestions) => {
              setQuestions(nextQuestions);
              setFieldErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith("questions."))));
            }}
            fieldErrors={fieldErrors}
            allowedTypes={["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "ESSAY", "SHORT_ANSWER"]}
          />
        </div>
      </ModuleActivityForm>
    </div>
  );
}
