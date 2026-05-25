import type { QuestWizardValues } from "@/features/teacher/components/CreateQuestWizard";

type GameSettingsStepProps = {
  values: QuestWizardValues;
  errors: Record<string, string>;
  onChange: <K extends keyof QuestWizardValues>(field: K, value: QuestWizardValues[K]) => void;
};

const fields: Array<{ key: keyof QuestWizardValues; label: string; min: number; max: number }> = [
  { key: "requiredPuzzlePieces", label: "Required puzzle pieces", min: 1, max: 100 },
  { key: "maxHearts", label: "Max hearts", min: 1, max: 20 },
  { key: "xpReward", label: "XP reward", min: 0, max: 100000 },
  { key: "coinReward", label: "Coin reward", min: 0, max: 100000 },
];

export function GameSettingsStep({ values, errors, onChange }: GameSettingsStepProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-primary/15 bg-black/20 p-4 text-sm text-stone-foreground/75">
        Hints use the student's hint tokens. Teachers add hint content by writing solution steps for
        each question.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="grid gap-2">
            <span className="text-sm font-semibold text-stone-foreground/80">{field.label}</span>
            <input
              className="teacher-input"
              min={field.min}
              max={field.max}
              type="number"
              value={values[field.key] as number}
              onChange={(event) => onChange(field.key, Number(event.target.value) as never)}
            />
            {errors[field.key] ? (
              <span className="text-xs text-destructive">{errors[field.key]}</span>
            ) : null}
          </label>
        ))}
      </div>
    </div>
  );
}
