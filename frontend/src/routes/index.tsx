import { createFileRoute, Link } from "@tanstack/react-router";
import { ForestBackground } from "@/components/ForestBackground";
import { Sparkles, Sword, BookOpenText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Algebra Quest: The Lost Pieces" },
      {
        name: "description",
        content:
          "A fantasy adventure where students master algebra by solving puzzles and recovering lost relics.",
      },
      { property: "og:title", content: "Algebra Quest: The Lost Pieces" },
      {
        property: "og:description",
        content: "Fantasy gamified algebra learning for students and teachers.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <ForestBackground>
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-fade-up max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-4 animate-float">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-6xl">🗡️</span>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-5xl sm:text-7xl text-primary glow-text leading-tight">
            Algebra Quest
          </h1>
          <p className="font-display text-xl sm:text-2xl text-foreground/90 mt-2 italic">
            The Lost Pieces
          </p>
          <p className="text-foreground/80 mt-6 text-lg max-w-xl mx-auto">
            Venture deep into enchanted forests, solve ancient equations, and recover the relics of
            forgotten realms.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="btn-game text-base">
              <Sword className="w-5 h-5" /> Begin Quest
            </Link>
            <Link to="/login" className="btn-game btn-stone text-base">
              <BookOpenText className="w-5 h-5" /> Sage's Council
            </Link>
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: "⚔️", title: "Battle equations", text: "Solve to earn coins and pieces." },
              { icon: "🧩", title: "Recover relics", text: "Restore the lost puzzle pieces." },
              { icon: "🧙", title: "Sage tools", text: "Teachers craft levels & questions." },
            ].map((c) => (
              <div key={c.title} className="panel-stone p-5">
                <div className="text-3xl mb-2">{c.icon}</div>
                <h3 className="font-display text-lg text-primary">{c.title}</h3>
                <p className="text-stone-foreground/80 text-sm mt-1">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </ForestBackground>
  );
}
