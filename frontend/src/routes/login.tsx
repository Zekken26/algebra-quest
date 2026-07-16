import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BookOpenText,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { ForestBackground } from "@/components/ForestBackground";
import { fetchStudentEnrollmentStatus } from "@/features/student/services/studentService";
import { resolveAvatarUrl, saveAuth, type AuthUser, type Role } from "@/lib/store";

type AuthMode = "login" | "create";
type BackendRole = "STUDENT" | "TEACHER";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type AuthResponse = {
  success: boolean;
  data?: {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: BackendRole;
      avatarUrl?: string | null;
    };
  };
  error?: { message?: string };
};

function toFrontendUser(data: NonNullable<AuthResponse["data"]>): AuthUser {
  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role === "TEACHER" ? "teacher" : "student",
    avatarUrl: resolveAvatarUrl(data.user.avatarUrl),
  };
}

async function requestAuth(
  mode: AuthMode,
  input: { name: string; email: string; password: string; role: Role },
) {
  const response = await fetch(`${API_BASE_URL}/auth/${mode === "create" ? "register" : "login"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(
      mode === "create"
        ? {
            name: input.name,
            email: input.email,
            password: input.password,
            role: input.role === "teacher" ? "TEACHER" : "STUDENT",
          }
        : {
            email: input.email,
            password: input.password,
          },
    ),
  });

  const payload = (await response.json()) as AuthResponse;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error?.message ?? "Unable to authenticate. Please try again.");
  }

  return toFrontendUser(payload.data);
}

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Enter Algebra Quest" },
      { name: "description", content: "Login or create an account to continue Algebra Quest." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "create" && !name.trim()) {
      setError("Display name is required.");
      return;
    }

    if (mode === "create" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "create" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const user = await requestAuth(mode, { name: name.trim(), email, password, role });
      saveAuth(user);
      if (user.role === "student") {
        const enrollment = await fetchStudentEnrollmentStatus();
        navigate({ to: enrollment.hasJoinedClass ? "/student" : "/student/join-class" });
        return;
      }

      navigate({ to: "/teacher" });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ForestBackground>
      <main className="grid min-h-screen place-items-center px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid w-full max-w-6xl overflow-hidden rounded-[1.25rem] border border-primary/25 bg-[oklch(0.16_0.04_165/0.72)] shadow-[0_28px_80px_oklch(0_0_0/0.58)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="relative hidden min-h-[620px] overflow-hidden border-r border-primary/15 p-8 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.78_0.16_80/0.22),transparent_32%),radial-gradient(circle_at_70%_75%,oklch(0.65_0.18_155/0.18),transparent_34%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-black/25 px-3 py-1 text-sm text-primary">
                  <Sparkles className="h-4 w-4" />
                  Algebra Quest
                </div>
                <h1 className="font-display text-6xl leading-tight text-primary glow-text">
                  Learn algebra through quests.
                </h1>
                <p className="mt-5 max-w-md text-lg leading-8 text-stone-foreground/78">
                  Enter the forest, review quest guides, solve equations, collect puzzle pieces, and
                  unlock each gate.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    icon: BookOpenText,
                    title: "Guided learning",
                    text: "Short quest guides before every challenge.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Mastery by play",
                    text: "Puzzle-based algebra practice replaces long drills.",
                  },
                  {
                    icon: GraduationCap,
                    title: "Teacher ready",
                    text: "Student and teacher portals share one adventure world.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-primary/15 bg-black/24 p-4"
                    >
                      <div className="flex gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-display text-primary">{item.title}</p>
                          <p className="text-sm text-stone-foreground/68">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 flex items-center justify-center gap-3 animate-float lg:justify-start">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-6xl" aria-hidden="true">
                  🗡️
                </span>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="font-display text-sm uppercase tracking-[0.28em] text-accent">
                {mode === "login" ? "Welcome back" : "Create account"}
              </p>
              <h2 className="mt-2 font-display text-4xl text-primary glow-text">
                {mode === "login" ? "Enter the Realm" : "Join the Quest"}
              </h2>
              <p className="mt-2 text-sm text-stone-foreground/70">
                {mode === "login"
                  ? "Continue your student adventure or teacher dashboard."
                  : "Create a student or teacher profile for Algebra Quest."}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "create" ? (
                <AuthField
                  label="Display name"
                  icon={UserRound}
                  value={name}
                  onChange={setName}
                  placeholder="Your name"
                />
              ) : null}

              <AuthField
                label="Email"
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />

              <AuthField
                label="Password"
                icon={Lock}
                isPassword
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
              />

              {mode === "create" ? (
                <AuthField
                  label="Confirm password"
                  icon={Lock}
                  isPassword
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm your password"
                />
              ) : null}

              <div>
                <label className="mb-2 block font-display text-sm text-primary">
                  Choose your portal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["student", "teacher"] as Role[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={`rounded-2xl border px-4 py-3 font-display text-sm uppercase tracking-wide transition ${
                        role === item
                          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow-gold)]"
                          : "border-primary/20 bg-black/25 text-stone-foreground/80 hover:border-primary/60 hover:text-primary"
                      }`}
                    >
                      {item === "student" ? "Student" : "Teacher"}
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <button type="submit" className="btn-game w-full" disabled={submitting}>
                {submitting
                  ? "Opening Portal..."
                  : mode === "login"
                    ? "Begin Quest"
                    : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode((current) => (current === "login" ? "create" : "login"));
                }}
                className="w-full rounded-xl border border-primary/15 bg-black/20 px-4 py-3 text-sm text-stone-foreground/78 transition hover:border-primary/40 hover:text-primary"
              >
                {mode === "login"
                  ? "New to Algebra Quest? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </form>
          </div>
        </motion.section>
      </main>
    </ForestBackground>
  );
}

type AuthFieldProps = {
  label: string;
  icon: typeof Mail;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  isPassword?: boolean;
};

function AuthField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  isPassword,
}: AuthFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-2 block font-display text-sm text-primary">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
        <input
          type={isPassword && !show ? "password" : "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-12 w-full rounded-2xl border border-primary/20 bg-black/25 text-stone-foreground outline-none transition placeholder:text-stone-foreground/35 focus:border-primary focus:ring-2 focus:ring-primary/20 ${isPassword ? "pr-10" : "pr-3"} pl-10`}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 transition hover:text-primary"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </span>
    </label>
  );
}
