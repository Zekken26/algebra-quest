import { BookCheck, BookOpen, Eye, EyeOff, FileText, Pencil, Swords, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { ActivityItem } from "@/features/teacher/types/teacher.types";

const TYPE_CONFIG = {
  QUEST: {
    icon: Swords,
    label: "Quest",
    color: "border-l-emerald-500/60 bg-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-400",
  },
  ASSIGNMENT: {
    icon: FileText,
    label: "Assignment",
    color: "border-l-purple-500/60 bg-purple-500/5",
    iconBg: "bg-purple-500/15 text-purple-400",
  },
  PRE_TEST: {
    icon: BookOpen,
    label: "Pre-Test",
    color: "border-l-blue-500/60 bg-blue-500/5",
    iconBg: "bg-blue-500/15 text-blue-400",
  },
  ASSESSMENT: {
    icon: Trophy,
    label: "Assessment",
    color: "border-l-amber-500/60 bg-amber-500/5",
    iconBg: "bg-amber-500/15 text-amber-400",
  },
};

type Props = {
  activity: ActivityItem;
  onDeleted: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ActivityCard({ activity, onDeleted, onTogglePublish, onEdit }: Props) {
  const config = TYPE_CONFIG[activity.type];
  const Icon = config.icon;
  const questionsCount = activity.quest?._count?.questions ?? activity.content?._count?.questions ?? 0;
  const submissionsCount = activity._count?.submissions ?? 0;

  const handleDelete = async () => {
    if (!confirm(`Delete "${activity.title}"? This cannot be undone.`)) return;
    try {
      const { deleteActivity } = await import("@/features/teacher/services/teacherService");
      await deleteActivity(activity.id);
      toast.success("Activity deleted.");
      onDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete.");
    }
  };

  const handleTogglePublish = async () => {
    try {
      const { togglePublishActivity } = await import("@/features/teacher/services/teacherService");
      await togglePublishActivity(activity.id);
      toast.success(activity.isPublished ? "Activity unpublished." : "Activity published.");
      onTogglePublish();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update.");
    }
  };

  return (
    <div className={`rounded-xl border border-primary/10 border-l-4 p-4 ${config.color}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`mt-1 rounded-lg p-2 ${config.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg text-primary truncate">{activity.title}</h3>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-stone-foreground/60">
              <span>{config.label}</span>
              {activity.dueDate ? (
                <>
                  <span>&bull;</span>
                  <span>Due {formatDate(activity.dueDate)}</span>
                </>
              ) : null}
              <span>&bull;</span>
              <span>{questionsCount} question{questionsCount !== 1 ? "s" : ""}</span>
              {submissionsCount > 0 ? (
                <>
                  <span>&bull;</span>
                  <span>{submissionsCount} submission{submissionsCount !== 1 ? "s" : ""}</span>
                </>
              ) : null}
            </p>
            {activity.description ? (
              <p className="mt-1 text-sm text-stone-foreground/70 line-clamp-2">{activity.description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              activity.isPublished
                ? "bg-success/15 text-success"
                : "bg-stone-500/15 text-stone-400"
            }`}
          >
            {activity.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {activity.totalPoints ? (
          <span className="text-xs text-stone-foreground/50">{activity.totalPoints} pts</span>
        ) : <span />}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn-game btn-stone text-xs px-2 py-1"
            onClick={onEdit}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`btn-game text-xs px-2 py-1 ${activity.isPublished ? "btn-stone" : ""}`}
            onClick={() => void handleTogglePublish()}
            title={activity.isPublished ? "Unpublish" : "Publish"}
          >
            {activity.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            className="btn-game text-xs px-2 py-1"
            onClick={() => void handleDelete()}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
