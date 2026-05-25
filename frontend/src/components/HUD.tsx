import { Heart, Coins, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { clearAuth, getAuth } from "@/lib/store";

export function HUD({ hearts, coins, pieces }: { hearts: number; coins: number; pieces: number }) {
  const navigate = useNavigate();
  const user = typeof window !== "undefined" ? getAuth() : null;

  return (
    <header className="sticky top-0 z-30 px-4 py-3 backdrop-blur-md bg-background/40 border-b border-border">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
        <Link to="/student" className="flex items-center gap-2">
          <span className="text-2xl">🗡️</span>
          <span className="font-display font-bold text-lg sm:text-xl glow-text text-primary">
            Algebra Quest
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="hud-chip">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${
                  i < hearts ? "fill-destructive text-destructive" : "text-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          <div className="hud-chip">
            <Coins className="w-5 h-5 text-gold" />
            <span>{coins}</span>
          </div>
          <div className="hud-chip">
            <span className="text-lg">🧩</span>
            <span>{pieces}</span>
          </div>
          <div className="hud-chip">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user?.name ?? "Hero"}</span>
          </div>
          <button
            className="hud-chip hover:text-destructive transition-colors"
            onClick={() => {
              clearAuth();
              navigate({ to: "/login" });
            }}
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
