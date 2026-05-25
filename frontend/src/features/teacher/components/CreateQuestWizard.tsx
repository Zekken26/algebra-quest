import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createTeacherGuide,
  createTeacherQuest,
  type TeacherSection,
} from "@/features/teacher/services/teacherService";
import { GameSettingsStep } from "@/features/teacher/components/GameSettingsStep";
import { QuestGuideStep } from "@/features/teacher/components/QuestGuideStep";
import { QuestInfoStep } from "@/features/teacher/components/QuestInfoStep";
import { QuestQuestionsStep } from "@/features/teacher/components/QuestQuestionsStep";
import { ReviewPublishStep } from "@/features/teacher/components/ReviewPublishStep";

export type QuestQuestionDraft = {
  id: string;
  equation: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  solutionSteps: string[];
};

export type QuestWizardValues = {
  title: string;
  worldName: string;
  topic: string;
  difficulty: string;
  sectionId: string;
  levelNumber: number;
  shortExplanation: string;
  exampleProblem: string;
  solutionStepsText: string;
  tipsText: string;
  requiredPuzzlePieces: number;
  maxHearts: number;
  hintLimit: number;
  xpReward: number;
  coinReward: number;
  questions: QuestQuestionDraft[];
};

type CreateQuestWizardProps = {
  sections: TeacherSection[];
  onComplete: () => void;
  onCancel: () => void;
  initialSectionId?: string;
};

const steps = ["Quest Info", "Quest Guide", "Game Settings", "Quest Questions", "Review & Publish"];

function newQuestion(): QuestQuestionDraft {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    equation: "",
    choices: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    solutionSteps: [""],
  };
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function defaultValues(sectionId = ""): QuestWizardValues {
  return {
    title: "",
    worldName: "",
    topic: "",
    difficulty: "Easy",
    sectionId,
    levelNumber: 1,
    shortExplanation: "",
    exampleProblem: "",
    solutionStepsText: "",
    tipsText: "",
    requiredPuzzlePieces: 3,
    maxHearts: 3,
    hintLimit: 3,
    xpReward: 100,
    coinReward: 50,
    questions: [newQuestion()],
  };
}

export function CreateQuestWizard({
  sections,
  onComplete,
  onCancel,
  initialSectionId = "",
}: CreateQuestWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<QuestWizardValues>(() => defaultValues(initialSectionId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const progress = useMemo(() => Math.round(((activeStep + 1) / steps.length) * 100), [activeStep]);

  const updateField = <K extends keyof QuestWizardValues>(
    field: K,
    value: QuestWizardValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const updateQuestion = (index: number, patch: Partial<QuestQuestionDraft>) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.questions;
      return next;
    });
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        const oldChoice = question.choices[choiceIndex];
        const choices = question.choices.map((choice, currentChoiceIndex) =>
          currentChoiceIndex === choiceIndex ? value : choice,
        );
        return {
          ...question,
          choices,
          correctAnswer: question.correctAnswer === oldChoice ? value : question.correctAnswer,
        };
      }),
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.questions;
      return next;
    });
  };

  const updateSolutionStep = (questionIndex: number, stepIndex: number, value: string) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              solutionSteps: question.solutionSteps.map((step, currentStepIndex) =>
                currentStepIndex === stepIndex ? value : step,
              ),
            }
          : question,
      ),
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.questions;
      return next;
    });
  };

  const addSolutionStep = (questionIndex: number) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? { ...question, solutionSteps: [...question.solutionSteps, ""] }
          : question,
      ),
    }));
  };

  const removeSolutionStep = (questionIndex: number, stepIndex: number) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              solutionSteps:
                question.solutionSteps.length === 1
                  ? question.solutionSteps
                  : question.solutionSteps.filter(
                      (_, currentStepIndex) => currentStepIndex !== stepIndex,
                    ),
            }
          : question,
      ),
    }));
  };

  const moveSolutionStep = (questionIndex: number, stepIndex: number, direction: -1 | 1) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        const nextIndex = stepIndex + direction;
        if (nextIndex < 0 || nextIndex >= question.solutionSteps.length) return question;
        const solutionSteps = [...question.solutionSteps];
        [solutionSteps[stepIndex], solutionSteps[nextIndex]] = [
          solutionSteps[nextIndex],
          solutionSteps[stepIndex],
        ];
        return { ...question, solutionSteps };
      }),
    }));
  };

  const addQuestion = () => {
    setValues((current) => ({ ...current, questions: [...current.questions, newQuestion()] }));
  };

  const removeQuestion = (index: number) => {
    setValues((current) => ({
      ...current,
      questions:
        current.questions.length === 1
          ? current.questions
          : current.questions.filter((_, questionIndex) => questionIndex !== index),
    }));
  };

  const validateStep = (step: number) => {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (values.title.trim().length < 2) nextErrors.title = "Quest title is required.";
      if (values.worldName.trim().length < 2)
        nextErrors.worldName = "World or level name is required.";
      if (values.topic.trim().length < 2) nextErrors.topic = "Topic is required.";
      if (sections.length === 0) nextErrors.sectionId = "You need to create a section first.";
      else if (!values.sectionId)
        nextErrors.sectionId = "Please select a section before creating a quest.";
      if (!Number.isInteger(values.levelNumber) || values.levelNumber < 1)
        nextErrors.levelNumber = "Use a positive level number.";
    }

    if (step === 1) {
      if (values.shortExplanation.trim().length < 5)
        nextErrors.shortExplanation = "Add a short guide explanation.";
      if (!values.exampleProblem.trim()) nextErrors.exampleProblem = "Add an example problem.";
      if (splitLines(values.solutionStepsText).length === 0)
        nextErrors.solutionStepsText = "Add at least one solution step.";
    }

    if (step === 2) {
      if (values.requiredPuzzlePieces < 1)
        nextErrors.requiredPuzzlePieces = "Require at least one puzzle piece.";
      if (values.maxHearts < 1) nextErrors.maxHearts = "Max hearts must be at least one.";
      if (values.xpReward < 0) nextErrors.xpReward = "XP reward cannot be negative.";
      if (values.coinReward < 0) nextErrors.coinReward = "Coin reward cannot be negative.";
    }

    if (step === 3) {
      const invalidQuestion = values.questions.find((question) => {
        const choices = question.choices.map((choice) => choice.trim());
        return (
          !question.equation.trim() ||
          choices.length !== 4 ||
          choices.some((choice) => !choice) ||
          !question.correctAnswer.trim() ||
          !choices.includes(question.correctAnswer.trim()) ||
          !question.explanation.trim() ||
          question.solutionSteps.map((step) => step.trim()).filter(Boolean).length === 0
        );
      });
      if (values.questions.length === 0 || invalidQuestion) {
        nextErrors.questions =
          "Complete every question with four choices, a matching correct answer, explanation, and solution steps.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const submit = async (isPublished: boolean) => {
    for (let step = 0; step < steps.length - 1; step += 1) {
      if (!validateStep(step)) {
        setActiveStep(step);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (sections.length === 0) {
        throw new Error("You need to create a section first.");
      }
      if (!values.sectionId) {
        throw new Error("Please select a section before creating a quest.");
      }

      const guide = await createTeacherGuide({
        title: `${values.title.trim()} Guide`,
        topic: values.topic.trim(),
        shortExplanation: values.shortExplanation.trim(),
        exampleProblem: values.exampleProblem.trim(),
        solutionSteps: splitLines(values.solutionStepsText),
        tips: splitLines(values.tipsText),
        sectionId: values.sectionId,
      });

      await createTeacherQuest({
        title: values.title.trim(),
        worldName: values.worldName.trim(),
        topic: values.topic.trim(),
        difficulty: values.difficulty,
        requiredPuzzlePieces: values.requiredPuzzlePieces,
        maxHearts: values.maxHearts,
        hintLimit: values.hintLimit,
        xpReward: values.xpReward,
        coinReward: values.coinReward,
        levelNumber: values.levelNumber,
        sectionId: values.sectionId,
        guideId: guide.id,
        isPublished,
        questions: values.questions.map((question) => ({
          equation: question.equation.trim(),
          choices: question.choices.map((choice) => choice.trim()),
          correctAnswer: question.correctAnswer.trim(),
          explanation: question.explanation.trim(),
          solutionSteps: question.solutionSteps.map((step) => step.trim()).filter(Boolean),
        })),
      });

      toast.success(isPublished ? "Quest published." : "Quest saved as draft.");
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create quest.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepBody =
    activeStep === 0 ? (
      <QuestInfoStep values={values} sections={sections} errors={errors} onChange={updateField} />
    ) : activeStep === 1 ? (
      <QuestGuideStep values={values} errors={errors} onChange={updateField} />
    ) : activeStep === 2 ? (
      <GameSettingsStep values={values} errors={errors} onChange={updateField} />
    ) : activeStep === 3 ? (
      <QuestQuestionsStep
        questions={values.questions}
        errors={errors}
        onAdd={addQuestion}
        onRemove={removeQuestion}
        onQuestionChange={updateQuestion}
        onChoiceChange={updateChoice}
        onSolutionStepChange={updateSolutionStep}
        onAddSolutionStep={addSolutionStep}
        onRemoveSolutionStep={removeSolutionStep}
        onMoveSolutionStep={moveSolutionStep}
      />
    ) : (
      <ReviewPublishStep values={values} sections={sections} />
    );

  return (
    <section className="teacher-card p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-accent">
            Quest Forge
          </p>
          <h2 className="mt-1 font-display text-2xl text-primary">{steps[activeStep]}</h2>
        </div>
        <button
          type="button"
          className="btn-game btn-stone text-sm"
          onClick={onCancel}
          disabled={submitting}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Modules
        </button>
      </div>

      <div className="mb-6">
        <div className="mb-3 grid gap-2 md:grid-cols-5">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                index === activeStep
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-primary/15 bg-black/20 text-stone-foreground/65"
              }`}
              onClick={() => {
                if (index <= activeStep || validateStep(activeStep)) setActiveStep(index);
              }}
              disabled={submitting}
            >
              <span className="block font-semibold">Step {index + 1}</span>
              <span>{step}</span>
            </button>
          ))}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-[var(--gradient-gold)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          You need to create a section first.
        </div>
      ) : null}

      {stepBody}

      {activeStep < steps.length - 1 ? (
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            className="btn-game btn-stone text-sm"
            onClick={back}
            disabled={activeStep === 0 || submitting}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button type="button" className="btn-game text-sm" onClick={next} disabled={submitting}>
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            className="btn-game btn-stone text-sm"
            onClick={back}
            disabled={submitting}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-game btn-stone text-sm"
              onClick={() => void submit(false)}
              disabled={submitting}
            >
              <Save className="h-4 w-4" /> {submitting ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              className="btn-game text-sm"
              onClick={() => void submit(true)}
              disabled={submitting}
            >
              <Send className="h-4 w-4" /> {submitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
