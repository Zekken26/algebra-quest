import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, School, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ForestBackground } from "@/components/ForestBackground";
import { StudentNavbar } from "@/features/student/components/StudentNavbar";
import {
  fetchStudentEnrollmentStatus,
  getStudentProgress,
  joinClassByCode,
  type StudentEnrollmentStatus,
} from "@/features/student/services/studentService";

export function JoinClassPage() {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState("");
  const [enrollment, setEnrollment] = useState<StudentEnrollmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const progress = getStudentProgress();

  useEffect(() => {
    let mounted = true;
    fetchStudentEnrollmentStatus()
      .then((status) => {
        if (mounted) setEnrollment(status);
      })
      .catch((requestError) => {
        if (mounted)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to check class enrollment.",
          );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!classCode.trim()) {
      setError("Enter the class code your teacher shared.");
      return;
    }

    setJoining(true);
    try {
      const joinedClass = await joinClassByCode(classCode);
      toast.success(`Joined ${joinedClass.name}.`);
      navigate({ to: "/student" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to join class.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <ForestBackground>
      <StudentNavbar progress={progress} />
      <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-5xl place-items-center px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="quest-panel w-full max-w-2xl overflow-hidden p-6 sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.24em] text-accent">
                Class Enrollment
              </p>
              <h1 className="mt-2 font-display text-4xl text-primary glow-text">Join Class</h1>
              <p className="mt-3 text-stone-foreground/80">
                Join a class first before starting quests.
              </p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-black/25 text-primary">
              <School className="h-7 w-7" />
            </div>
          </div>

          {loading ? (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-primary/20 bg-black/20 p-4 text-sm text-stone-foreground/75">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Checking your current classes...
            </div>
          ) : enrollment?.hasJoinedClass ? (
            <div className="mb-5 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm text-stone-foreground/80">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                You can join another class with a new code.
              </div>
              <button
                type="button"
                className="btn-game mt-3 text-sm"
                onClick={() => navigate({ to: "/student" })}
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-5">
            <label className="grid gap-2">
              <span className="font-display text-sm text-primary">Class code</span>
              <input
                className="input-rune h-13 uppercase"
                value={classCode}
                onChange={(event) => setClassCode(event.target.value)}
                placeholder="TEACHA"
                maxLength={12}
                autoComplete="off"
                disabled={joining}
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn-game w-full text-sm" disabled={joining}>
              {joining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {joining ? "Joining..." : "Join Class"}
            </button>
          </form>
        </motion.section>
      </main>
    </ForestBackground>
  );
}
