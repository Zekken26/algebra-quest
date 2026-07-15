import { useState } from "react";
import { toast } from "sonner";
import { CreateQuestWizard } from "@/features/teacher/components/CreateQuestWizard";
import { ClassContentForm } from "@/features/teacher/components/ClassContentForm";
import type { ActivityType } from "@/features/teacher/types/teacher.types";
import type { TeacherSection } from "@/features/teacher/services/teacherService";

const TYPE_OPTIONS: Array<{ value: ActivityType; label: string; description: string }> = [
  { value: "QUEST", label: "🗡 Quest", description: "Interactive math quest with puzzle pieces, hearts, and hints." },
  { value: "ASSIGNMENT", label: "📄 Assignment", description: "Written questions or file submission. Teacher can review and manually grade." },
  { value: "PRE_TEST", label: "📘 Pre-Test", description: "Auto-graded diagnostic to measure prior knowledge before lessons." },
  { value: "ASSESSMENT", label: "🏆 Assessment", description: "Quiz/exam with multiple question types. Auto-scored and recorded in gradebook." },
];

type Props = {
  classId: string;
  sectionId: string;
  currentSection?: TeacherSection | null;
  onClose: () => void;
  onCreated: () => void;
};

export function ActivityForm({ classId, sectionId, currentSection, onClose, onCreated }: Props) {
  const [step, setStep] = useState<"select-type" | ActivityType>("select-type");
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);

  if (step === "QUEST") {
    const section = currentSection ?? { id: classId, name: "", code: "" };
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <CreateQuestWizard
            sections={[section as any]}
            initialSectionId={classId}
            onCancel={() => {
              setStep("select-type");
              setSelectedType(null);
            }}
            onComplete={() => {
              onCreated();
            }}
          />
        </div>
      </div>
    );
  }

  if (step === "ASSIGNMENT" || step === "PRE_TEST" || step === "ASSESSMENT") {
    const contentType = step === "PRE_TEST" ? "PRETEST" as const : step;
    return (
      <ClassContentForm
        type={contentType}
        classId={classId}
        sectionId={sectionId}
        onClose={() => {
          setStep("select-type");
          setSelectedType(null);
        }}
        onCreated={onCreated}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-primary/20 bg-[var(--color-background)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl text-primary">Create New Activity</h2>
          <button type="button" className="btn-game btn-stone text-xs" onClick={onClose}>
            Cancel
          </button>
        </div>

        <p className="mb-4 text-sm text-stone-foreground/70">
          Select the type of activity you want to create.
        </p>

        <div className="grid gap-3">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                selectedType === option.value
                  ? "border-primary bg-primary/10"
                  : "border-primary/10 bg-black/20 hover:border-primary/30"
              }`}
              onClick={() => setSelectedType(option.value)}
              onDoubleClick={() => {
                setSelectedType(option.value);
                setStep(option.value);
              }}
            >
              <div className="mt-0.5 text-xl">{option.label.split(" ")[0]}</div>
              <div>
                <p className="font-display text-lg text-primary">{option.label.split(" ").slice(1).join(" ")}</p>
                <p className="mt-1 text-sm text-stone-foreground/70">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-game btn-stone text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-game text-sm"
            disabled={!selectedType}
            onClick={() => {
              if (selectedType) setStep(selectedType);
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
