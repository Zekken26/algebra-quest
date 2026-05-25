type EmptyStateProps = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="panel-stone p-6 text-center">
      <p className="font-display text-xl text-primary">{title}</p>
      {message ? <p className="text-stone-foreground/70 mt-1">{message}</p> : null}
    </div>
  );
}
