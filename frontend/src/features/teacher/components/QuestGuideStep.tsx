import type { QuestWizardValues } from "@/features/teacher/components/CreateQuestWizard";

type QuestGuideStepProps = {
  values: QuestWizardValues;
  errors: Record<string, string>;
  onChange: <K extends keyof QuestWizardValues>(field: K, value: QuestWizardValues[K]) => void;
};

export function QuestGuideStep({ values, errors, onChange }: QuestGuideStepProps) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-foreground/80">Short explanation</span>
        <textarea
          className="teacher-input min-h-28"
          value={values.shortExplanation}
          onChange={(event) => onChange("shortExplanation", event.target.value)}
          placeholder="Explain the rule students should use before entering the quest."
        />
        {errors.shortExplanation ? (
          <span className="text-xs text-destructive">{errors.shortExplanation}</span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-foreground/80">Example problem</span>
        <input
          className="teacher-input"
          value={values.exampleProblem}
          onChange={(event) => onChange("exampleProblem", event.target.value)}
          placeholder="3x + 4 = 19"
        />
        {errors.exampleProblem ? (
          <span className="text-xs text-destructive">{errors.exampleProblem}</span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-foreground/80">
          Step-by-step solution
        </span>
        <textarea
          className="teacher-input min-h-32"
          value={values.solutionStepsText}
          onChange={(event) => onChange("solutionStepsText", event.target.value)}
          placeholder={"Subtract 4 from both sides.\nDivide both sides by 3.\nx = 5."}
        />
        {errors.solutionStepsText ? (
          <span className="text-xs text-destructive">{errors.solutionStepsText}</span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-stone-foreground/80">Tips / reminders</span>
        <textarea
          className="teacher-input min-h-24"
          value={values.tipsText}
          onChange={(event) => onChange("tipsText", event.target.value)}
          placeholder={"Undo addition or subtraction first.\nKeep both sides balanced."}
        />
      </label>
    </div>
  );
}
