type ModuleActivityCardAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "stone";
};

type ModuleActivityCardProps = {
  title: string;
  subtitle?: string;
  status: "draft" | "published";
  stats?: { label: string; value: string | number }[];
  actions: ModuleActivityCardAction[];
  isSelected?: boolean;
  onSelect?: () => void;
};

export function ModuleActivityCard({
  title,
  subtitle,
  status,
  stats,
  actions,
  isSelected,
  onSelect,
}: ModuleActivityCardProps) {
  return (
    <article
      className={`rounded-2xl border bg-black/20 p-4 transition-all duration-200 ${
        isSelected ? "border-primary" : "border-primary/15 hover:border-primary/30"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {onSelect && (
              <input
                type="radio"
                checked={isSelected}
                onChange={onSelect}
                className="h-4 w-4 accent-primary"
                aria-label={`Select ${title}`}
              />
            )}
          </div>
          <p className="break-words font-display text-lg text-primary">{title}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-stone-foreground/70">{subtitle}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            status === "published"
              ? "bg-success/15 text-success"
              : "bg-primary/15 text-primary"
          }`}
        >
          {status === "published" ? "Published" : "Draft"}
        </span>
      </div>
      {stats && stats.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-stone-foreground/60">{stat.label}</p>
              <p className="mt-0.5 font-display text-sm text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`btn-game text-xs ${action.variant === "stone" ? "btn-stone" : ""}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}
