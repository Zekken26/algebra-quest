import forestBg from "@/assets/forest-bg.jpg";
import { cn } from "@/lib/utils";

type ForestBackgroundProps = {
  children: React.ReactNode;
  allowOverflow?: boolean;
};

export function ForestBackground({ children, allowOverflow = false }: ForestBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full",
        allowOverflow ? "overflow-visible" : "overflow-x-clip overflow-y-visible",
      )}
    >
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${forestBg})` }}
      />
      <div className="fixed inset-0 -z-10 bg-[var(--gradient-forest)]" />
      {children}
    </div>
  );
}
