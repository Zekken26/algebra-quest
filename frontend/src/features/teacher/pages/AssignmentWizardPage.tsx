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
  type TeacherSection,
} from "@/features/teacher/services/teacherService";
import type { QuestionData } from "@/features/teacher/components/QuestionBuilder";

export function AssignmentWizardPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [submissionType, setSubmissionType] = useState("MULTIPLE_CHOICE");
  const [passingScore, setPassingScore] = useState("");

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
    const baseInput = {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      dueDate: data.dueDate,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      totalPoints: data.totalPoints,
      submissionType,
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
      const firstSectionId = data.sectionIds[0] || sections[0]?.id;
      if (!firstSectionId) {
        toast.error("No class available. Create a class first.");
        return;
      }
      for (const sid of data.sectionIds.length > 0 ? data.sectionIds : [firstSectionId]) {
        await createAssignment({ ...baseInput, sectionId: sid });
      }
      toast.success("Assignment created.");
      goToModules();
    } catch (error: any) {
      toast.error(error.message || "Failed to save assignment.");
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
      >
        <SettingsPanel title="Assignment Settings">
          <SettingsField label="Submission Type">
            <select
              className="teacher-input"
              value={submissionType}
              onChange={(e) => setSubmissionType(e.target.value)}
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="FILE_UPLOAD">File Upload</option>
              <option value="ESSAY">Essay</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="ATTACHMENTS">Attachments</option>
            </select>
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
        </SettingsPanel>

        <div className="mt-4">
          <QuestionBuilder
            questions={questions}
            onChange={setQuestions}
            allowedTypes={["MULTIPLE_CHOICE", "TRUE_FALSE", "IDENTIFICATION", "SHORT_ANSWER", "ESSAY"]}
          />
        </div>
      </ModuleActivityForm>
    </div>
  );
}
