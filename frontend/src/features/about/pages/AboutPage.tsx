import { motion, useReducedMotion } from "framer-motion";
import { BookOpenText, Sparkles } from "lucide-react";
import { ResearcherCard, type Researcher } from "@/features/about/components/ResearcherCard";

const researchers: Researcher[] = [
  {
    name: "Jomar D. Gacosta",
    role: "Researcher",
    organization: "Biliran Province State University",
    email: "jomargacosta0520@gmail.com",
    image: "/images/researchers/jomar-gacosta.jpg",
    imageAlt: "Professional portrait of Jomar D. Gacosta",
    bio: "Jomar is currently a pre-service Mathematics teacher driven by a passion for making Mathematics more engaging, accessible, and meaningful for every learner. He co-authored a research article published in an international journal and is a recipient of the CHED Merit Scholarship Program. He also passed the Civil Service Examination – Professional Level, reflecting his strong commitment to academic excellence and professional development.",
  },
  {
    name: "Amerson M. Bardoquillo",
    role: "Researcher",
    organization: "Biliran Province State University",
    email: "amersonbardoquillo0@gmail.com",
    image: "/images/researchers/amerson-bardoquillo.png",
    imageAlt: "Professional portrait of Amerson M. Bardoquillo",
    bio: "Amerson is currently a pre-service Mathematics teacher who is passionate about making Mathematics more engaging, accessible, and meaningful for every learner. He believes that students learn best through interactive and innovative teaching strategies that encourage critical thinking, problem-solving, and active participation. As a technology- and gadget-literate individual, he enjoys integrating digital tools and educational applications into the learning process to create more effective and enjoyable learning experiences. He is committed to continuously improving his teaching skills, expanding his knowledge in Mathematics education, and developing creative learning resources that inspire students to appreciate and excel in Mathematics.",
  },
];

export function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
      <motion.header
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="quest-hero overflow-hidden p-6 sm:p-8 lg:p-10"
      >
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-black/25 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            The Algebra Quest Story
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-primary glow-text sm:text-5xl lg:text-6xl">
            About Algebra Quest
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-foreground/80 sm:text-lg">
            A meaningful learning adventure where Grade 7 Mathematics meets discovery, practice, and
            play.
          </p>
        </div>
      </motion.header>

      <section className="quest-panel mt-6 p-6 sm:mt-8 sm:p-8" aria-labelledby="about-title">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_oklch(0.82_0.17_80/0.2)]">
              <BookOpenText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-xs uppercase tracking-[0.22em] text-accent">
                Learning through adventure
              </p>
              <h2 id="about-title" className="mt-1 font-display text-3xl text-primary sm:text-4xl">
                About Algebra Quest
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-stone-foreground/80 sm:text-base">
                <p>
                  Algebra Quest is a game-based learning application designed to help Grade 7
                  students strengthen their understanding of Algebra through interactive and
                  engaging learning experiences. The application addresses common learning gaps by
                  providing lessons, activities, and challenges aligned with the Grade 7 Mathematics
                  Budget of Work and the Department of Education (DepEd) learning competencies.
                </p>
                <p>
                  By combining education with gameplay, Algebra Quest encourages active learning,
                  builds mathematical confidence, and supports students in developing essential
                  algebraic knowledge and problem-solving skills in an enjoyable and meaningful way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 sm:mt-14" aria-labelledby="researchers-title">
        <div className="max-w-3xl">
          <p className="font-display text-xs uppercase tracking-[0.24em] text-accent">
            The people behind the quest
          </p>
          <h2
            id="researchers-title"
            className="mt-1 font-display text-3xl text-primary glow-text sm:text-4xl"
          >
            Meet the Researchers
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-foreground/75 sm:text-base">
            Meet the pre-service Mathematics teachers behind Algebra Quest and learn about their
            dedication to innovative and meaningful Mathematics education.
          </p>
        </div>

        <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 lg:gap-6">
          {researchers.map((researcher, index) => (
            <ResearcherCard key={researcher.email} researcher={researcher} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
