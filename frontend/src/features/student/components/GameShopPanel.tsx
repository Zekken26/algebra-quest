import { motion } from "framer-motion";
import { Coins, Heart, Lightbulb } from "lucide-react";

type ShopItem = {
  id: "health" | "hint" | "skip";
  title: string;
  cost: number;
  icon: typeof Heart;
  disabled: boolean;
  disabledReason?: string;
};

type GameShopPanelProps = {
  coins: number;
  hearts: number;
  maxHearts: number;
  canAct: boolean;
  onBuy: (item: ShopItem["id"]) => void;
};

export function GameShopPanel({ coins, hearts, maxHearts, canAct, onBuy }: GameShopPanelProps) {
  const items: ShopItem[] = [
    {
      id: "health",
      title: "Buy Health",
      cost: 10,
      icon: Heart,
      disabled: coins < 10 || hearts >= maxHearts,
      disabledReason: hearts >= maxHearts ? "Full" : "Need coins",
    },
    {
      id: "hint",
      title: "Buy Hint",
      cost: 10,
      icon: Lightbulb,
      disabled: coins < 10,
      disabledReason: "Need coins",
    },
  ];

  return (
    <section className="quest-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-primary">Quest Shop</h2>
        <motion.span
          key={coins}
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          className="hud-chip text-primary"
        >
          <Coins className="h-4 w-4" /> {coins}
        </motion.span>
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              disabled={!canAct || item.disabled}
              onClick={() => onBuy(item.id)}
              className="flex items-center justify-between rounded-xl border border-primary/20 bg-black/24 px-3 py-3 text-left transition hover:border-primary/50 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-primary" />
                <span>
                  <span className="block font-display text-primary">{item.title}</span>
                  <span className="text-xs text-stone-foreground/60">{item.cost} Coins</span>
                </span>
              </span>
              <span className="text-xs text-stone-foreground/60">
                {!canAct ? "Start" : item.disabled ? item.disabledReason : "Buy"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
