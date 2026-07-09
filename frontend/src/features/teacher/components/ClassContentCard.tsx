import { BookCheck, FileQuestion, Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ClassContentItem } from "@/features/teacher/types/teacher.types";

const TYPE_ICONS = {
  ASSIGNMENT: BookCheck,
  PRETEST: FileQuestion,
  ASSESSMENT: Swords,
};

const TYPE_STYLES = {
  ASSIGNMENT: "border-l-purple-500/60 bg-purple-500/5",
  PRETEST: "border-l-blue-500/60 bg-blue-500/5",
  ASSESSMENT: "border-l-amber-500/60 bg-amber-500/5",
};

type Props = {
  content: ClassContentItem;
  onDeleted: () => void;
};

export function ClassContentCard({ content, onDeleted }: Props) {
  const Icon = TYPE_ICONS[content.type];
  const style = TYPE_STYLES[content.type];

  const handleDelete = async () => {
    if (!confirm("Delete this content and all its data?")) return;
    try {
      const { deleteClassContent } = await import(
        "@/features/teacher/services/teacherService"
      );
      await deleteClassContent(content.id);
      toast.success("Content deleted.");
      onDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete.");
    }
  };

  return (
    <div className={`rounded-xl border border-primary/10 border-l-4 p-4 ${style}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-black/30 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg text-primary">{content.title}</h3>
            <p className="mt-0.5 flex items-center gap-3 text-xs text-stone-foreground/60">
              <span>
                {content._count?.questions ?? content.questions.length} question
                {(content._count?.questions ?? content.questions.length) !== 1 ? "s" : ""}
              </span>
              {content.timeLimitMinutes ? (
                <span>{content.timeLimitMinutes} min</span>
              ) : null}
              {content.maxScore ? <span>{content.maxScore} pts</span> : null}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-stone-foreground/40 transition-colors hover:text-destructive"
          onClick={() => void handleDelete()}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {content.instructions ? (
        <p className="mt-2 text-sm text-stone-foreground/70">{content.instructions}</p>
      ) : null}
    </div>
  );
}
