import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Mail, UserRound } from "lucide-react";

export interface Researcher {
  name: string;
  role: string;
  organization: string;
  email: string;
  image: string;
  imageAlt: string;
  bio: string;
}

type ResearcherCardProps = {
  researcher: Researcher;
  index: number;
};

export function ResearcherCard({ researcher, index }: ResearcherCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.08 }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      className="quest-panel group flex h-full min-w-0 flex-col p-5 transition-shadow duration-200 hover:shadow-[0_14px_0_oklch(0.14_0.025_165),0_28px_58px_oklch(0_0_0/0.5),var(--shadow-glow-gold)] sm:p-7"
    >
      <div className="flex flex-col items-center text-center">
        <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-primary/55 bg-black/25 p-1 shadow-[0_0_28px_oklch(0.82_0.17_80/0.28)] sm:h-40 sm:w-40">
          <img
            src={researcher.image}
            alt={researcher.imageAlt}
            className="h-full w-full rounded-full object-cover object-center transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105"
          />
        </div>
        <div className="mt-5 min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            {researcher.role}
          </p>
          <h3 className="mt-3 break-words font-display text-2xl leading-tight text-primary sm:text-3xl">
            {researcher.name}
          </h3>
        </div>
      </div>

      <div className="mt-5 border-y border-primary/15 py-4 text-sm">
        <p className="flex items-start justify-center gap-2 text-center leading-6 text-stone-foreground/75">
          <GraduationCap className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{researcher.organization}</span>
        </p>
        <a
          href={`mailto:${researcher.email}`}
          className="mt-3 flex min-w-0 items-start justify-center gap-2 break-all text-center leading-6 text-primary underline-offset-4 transition hover:text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Mail className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{researcher.email}</span>
        </a>
      </div>

      <p className="mt-5 text-sm leading-7 text-stone-foreground/80 sm:text-[0.95rem]">
        {researcher.bio}
      </p>
    </motion.article>
  );
}
