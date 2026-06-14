import type { TeacherSection } from "@/features/teacher/services/teacherService";
import type { QuestWizardValues } from "@/features/teacher/components/CreateQuestWizard";

type QuestInfoStepProps = {
  values: QuestWizardValues;
  sections: TeacherSection[];
  errors: Record<string, string>;
  onChange: <K extends keyof QuestWizardValues>(field: K, value: QuestWizardValues[K]) => void;
};

export function QuestInfoStep({ values, sections, errors, onChange }: QuestInfoStepProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-foreground/80">Quest title</span>
          <input
            className="teacher-input"
            value={values.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="The Crystal Balance Trial"
          />
          {errors.title ? <span className="text-xs text-destructive">{errors.title}</span> : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-foreground/80">World / level name</span>
          <input
            className="teacher-input"
            value={values.worldName}
            onChange={(event) => onChange("worldName", event.target.value)}
            placeholder="Moonlit Equation Gate"
          />
          {errors.worldName ? (
            <span className="text-xs text-destructive">{errors.worldName}</span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-foreground/80">Topic</span>
          <input
            className="teacher-input"
            value={values.topic}
            onChange={(event) => onChange("topic", event.target.value)}
            placeholder="Two-step equations"
          />
          {errors.topic ? <span className="text-xs text-destructive">{errors.topic}</span> : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-foreground/80">Difficulty</span>
          <select
            className="teacher-input"
            value={values.difficulty}
            onChange={(event) => onChange("difficulty", event.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
            <option>Boss</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-foreground/80">Section / class</span>
          <select
            className="teacher-input"
            value={values.sectionId}
            onChange={(event) => onChange("sectionId", event.target.value)}
            disabled={sections.length === 0}
          >
            <option value="">Select a section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
          {errors.sectionId ? (
            <span className="text-xs text-destructive">{errors.sectionId}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-stone-foreground/80 font-display">
            Level number
          </span>
          <input
            className="teacher-input bg-stone-900/50 text-stone-foreground/50 border-primary/10 cursor-not-allowed"
            type="number"
            value={values.levelNumber}
            disabled
          />
          <span className="text-[10px] text-stone-foreground/45">
            Automatically assigned based on section quest sequence.
          </span>
          {errors.levelNumber ? (
            <span className="text-xs text-destructive">{errors.levelNumber}</span>
          ) : null}
        </label>
      </div>
    </div>
  );
}
