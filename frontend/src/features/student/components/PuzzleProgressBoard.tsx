import { motion } from "framer-motion";

type PuzzleProgressBoardProps = {
  pieces: number;
  requiredPieces: number;
};

export function PuzzleProgressBoard({ pieces, requiredPieces }: PuzzleProgressBoardProps) {
  const progress = Math.round((pieces / requiredPieces) * 100);

  return (
    <section className="quest-panel p-5">
      <h2 className="font-display text-xl text-primary">Relic Puzzle</h2>
      <p className="mb-4 text-sm text-stone-foreground/70">
        Recover all pieces to complete the level.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: requiredPieces }).map((_, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={index < pieces ? { scale: [1, 1.16, 1], rotate: [0, 8, 0] } : {}}
            className="puzzle-slot"
            data-filled={index < pieces}
          >
            {index < pieces ? "\uD83E\uDDE9" : ""}
          </motion.div>
        ))}
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span>Level progress</span>
          <span className="font-display text-primary">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-primary/25 bg-black/25">
          <div className="h-full bg-[var(--gradient-gold)]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
