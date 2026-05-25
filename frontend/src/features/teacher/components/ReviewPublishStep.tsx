import { CheckCircle2 } from "lucide-react";
import type { TeacherSection } from "@/features/teacher/services/teacherService";
import type { QuestWizardValues } from "@/features/teacher/components/CreateQuestWizard";

type ReviewPublishStepProps = {
  values: QuestWizardValues;
  sections: TeacherSection[];
};

export function ReviewPublishStep({ values, sections }: ReviewPublishStepProps) {
  const section = sections.find((item) => item.id === values.sectionId);

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-primary/15 bg-black/20 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-5 w-5 text-success" />
          <div>
            <h3 className="font-display text-2xl text-primary">
              {values.title || "Untitled Quest"}
            </h3>
            <p className="text-sm text-stone-foreground/70">
              {values.worldName || "No world selected"} · {values.topic || "No topic"} ·{" "}
              {values.difficulty}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryItem label="Section" value={section?.name ?? "No section"} />
          <SummaryItem label="Level" value={String(values.levelNumber)} />
          <SummaryItem label="Questions" value={String(values.questions.length)} />
          <SummaryItem label="Puzzle pieces" value={String(values.requiredPuzzlePieces)} />
          <SummaryItem label="Hearts" value={String(values.maxHearts)} />
          <SummaryItem label="Hint rule" value="Student tokens" />
          <SummaryItem
            label="Rewards"
            value={`${values.xpReward} XP · ${values.coinReward} coins`}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-primary/15 bg-black/20 p-5">
        <h3 className="font-display text-xl text-primary">Guide Preview</h3>
        <p className="mt-2 text-sm text-stone-foreground/75">
          {values.shortExplanation || "No guide explanation yet."}
        </p>
        <p className="mt-3 text-sm font-semibold text-stone-foreground/80">
          Example: {values.exampleProblem || "No example yet."}
        </p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <p className="text-xs uppercase text-stone-foreground/50">{label}</p>
      <p className="mt-1 font-semibold text-stone-foreground">{value}</p>
    </div>
  );
}
