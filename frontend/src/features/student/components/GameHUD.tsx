import { motion } from "framer-motion";
import { Coins, Heart, Shield, Star } from "lucide-react";
import { resolveAvatarUrl } from "@/features/student/services/studentService";
import { getAuth } from "@/shared/services/api";

type GameHUDProps = {
  hearts: number;
  xp: number;
  coins: number;
  score: number;
};

export function GameHUD({ hearts, xp, coins, score }: GameHUDProps) {
  const user = getAuth();
  const studentName = user?.name || "Algebra Adventurer";
  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);
  const initials = studentName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 border-b border-primary/20 bg-background/80 px-4 py-3 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-primary/50 bg-[var(--gradient-gold)] text-xl font-bold text-gold-foreground shadow-[var(--shadow-glow-gold)]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${studentName}'s avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              initials || "A"
            )}
          </div>
          <div>
            <p className="font-display text-primary">{studentName}</p>
            <p className="text-xs text-stone-foreground/70">Score {score}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hud-chip">
            {Array.from({ length: 3 }).map((_, index) => (
              <Heart
                key={index}
                className={`h-4 w-4 ${index < hearts ? "fill-destructive text-destructive" : "text-stone-foreground/30"}`}
              />
            ))}
          </span>
          <span className="hud-chip">
            <Star className="h-4 w-4 text-primary" /> {xp} XP
          </span>
          <span className="hud-chip">
            <Coins className="h-4 w-4 text-primary" /> {coins}
          </span>
          <span className="hud-chip">
            <Shield className="h-4 w-4 text-accent" /> Auto saved
          </span>
        </div>
      </div>
    </motion.header>
  );
}
