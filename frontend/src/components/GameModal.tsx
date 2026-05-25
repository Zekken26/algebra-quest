import { ReactNode } from "react";

export function GameModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-up">
      <div className="panel-parchment w-full max-w-md p-6 sm:p-8 animate-fade-up">
        <h3 className="font-display text-2xl text-parchment-foreground mb-3">{title}</h3>
        <div className="text-parchment-foreground/90 space-y-3">{children}</div>
        {onClose && (
          <button onClick={onClose} className="btn-game mt-6 w-full">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
