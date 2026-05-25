import { Lightbulb, SkipForward, Zap } from "lucide-react";

type HintPanelProps = {
  hints: number;
  streak: number;
  canAct: boolean;
  revealedHints?: string[];
  onHint: () => void;
  onSkip: () => void;
};

export function HintPanel({
  hints,
  streak,
  canAct,
  revealedHints = [],
  onHint,
  onSkip,
}: HintPanelProps) {
  return (
    <section className="quest-panel p-5">
      <h2 className="font-display text-xl text-primary">Quest Tools</h2>
      <div className="mt-4 grid gap-3">
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-black/20 px-3 py-2">
          <span className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-primary" /> Hint tokens
          </span>
          <span className="font-display text-primary">{hints}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-accent/20 bg-black/20 px-3 py-2">
          <span className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-accent" /> Streak
          </span>
          <span className="font-display text-primary">{streak}</span>
        </div>
        <button
          onClick={onHint}
          disabled={!canAct || hints <= 0}
          className="btn-game btn-stone text-sm"
        >
          <Lightbulb className="h-4 w-4" /> Use Hint
        </button>
        <button onClick={onSkip} disabled={!canAct} className="btn-game btn-stone text-sm">
          <SkipForward className="h-4 w-4" /> Skip - 20 Coins
        </button>
      </div>
      {revealedHints.length > 0 ? (
        <div className="mt-4 rounded-xl border border-primary/15 bg-black/20 p-3">
          <p className="font-display text-sm text-primary">Hints Revealed</p>
          <ol className="mt-2 space-y-2 text-sm text-stone-foreground/75">
            {revealedHints.map((hint, index) => (
              <li key={`${index}-${hint}`} className="grid grid-cols-[3.5rem_1fr] gap-2">
                <span className="font-display text-primary">Step {index + 1}</span>
                <span>{hint}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
