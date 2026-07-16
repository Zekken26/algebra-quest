import { Plus } from "lucide-react";
import { ModuleActivityCard } from "./ModuleActivityCard";

export type ActivityListItem = {
  id: string;
  title: string;
  subtitle?: string;
  status: "draft" | "published";
  stats?: { label: string; value: string | number }[];
};

type ActivityListProps = {
  items: ActivityListItem[];
  onCreate: () => void;
  onSelect: (item: ActivityListItem) => void;
  onEdit: (item: ActivityListItem) => void;
  onDelete: (item: ActivityListItem) => void;
  onTogglePublish: (item: ActivityListItem) => void;
  onDuplicate?: (item: ActivityListItem) => void;
  selectedId?: string;
  title: string;
  subtitle: string;
  createLabel: string;
};

export function ActivityList({
  items,
  onCreate,
  onSelect,
  onEdit,
  onDelete,
  onTogglePublish,
  onDuplicate,
  selectedId,
  title,
  subtitle,
  createLabel,
}: ActivityListProps) {
  return (
    <section className="teacher-card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-primary">{title}</h2>
          <p className="text-sm text-stone-foreground/70">{subtitle}</p>
        </div>
        <button type="button" className="btn-game text-sm" onClick={onCreate}>
          <Plus className="h-4 w-4" /> {createLabel}
        </button>
      </div>
      <div className="grid gap-4">
        {items.length === 0 ? (
          <EmptyState message={`No ${title.toLowerCase()} yet. Create your first one!`} />
        ) : (
          items.map((item) => (
            <ModuleActivityCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              status={item.status}
              stats={item.stats}
              isSelected={selectedId === item.id}
              onSelect={() => onSelect(item)}
              actions={(() => {
                const acts: any[] = [
                  { label: "Select", variant: "stone", onClick: () => onSelect(item) },
                  { label: "Edit", variant: "stone", onClick: () => onEdit(item) },
                  { label: item.status === "published" ? "Unpublish" : "Publish", variant: "stone", onClick: () => onTogglePublish(item) },
                ];
                if (onDuplicate) {
                  acts.push({ label: "Duplicate", variant: "stone", onClick: () => onDuplicate(item) });
                }
                acts.push({ label: "Delete", onClick: () => onDelete(item) });
                return acts;
              })()}
            />
          ))
        )}
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/15 bg-black/20">
        <span className="text-2xl text-primary/40">📋</span>
      </div>
      <p className="text-sm text-stone-foreground/60">{message}</p>
    </div>
  );
}
