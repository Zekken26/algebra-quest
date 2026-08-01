import { Link } from "@tanstack/react-router";

type Props = {
  mode?: "login" | "create";
  onToggleMode?: (mode: "login" | "create") => void;
};

export function LandingNavbar({ mode, onToggleMode }: Props) {
  const isAuthPage = mode !== undefined;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-black/30">
      <Link to="/" className="flex items-center gap-3">
        <img src="/algebra-quest-logo.png" alt="Algebra Quest" className="h-9 w-9" />
        <span className="font-display text-lg text-primary glow-text">Algebra Quest</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link
          to="/about"
          className="text-sm text-stone-foreground/80 hover:text-primary transition-colors"
        >
          About
        </Link>
        {isAuthPage ? (
          <button
            type="button"
            className="btn-game text-sm !py-1.5 !px-4"
            onClick={() => onToggleMode?.(mode === "login" ? "create" : "login")}
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        ) : (
          <Link to="/login" className="btn-game text-sm !py-1.5 !px-4">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
