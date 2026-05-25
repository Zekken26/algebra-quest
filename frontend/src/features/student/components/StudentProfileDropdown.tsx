import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Pencil, ScrollText } from "lucide-react";
import { clearAuth } from "@/shared/services/api";

type StudentProfileDropdownProps = {
  open: boolean;
  onClose: () => void;
};

export function StudentProfileDropdown({ open, onClose }: StudentProfileDropdownProps) {
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    onClose();
    navigate({ to: "/login" });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 overflow-hidden rounded-2xl border border-primary/25 bg-[oklch(0.18_0.04_165/0.96)] p-2 shadow-[0_18px_50px_oklch(0_0_0/0.55)] backdrop-blur-xl"
        >
          <Link
            to="/student/profile/edit"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-foreground/85 transition hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-4 w-4" /> Edit Profile
          </Link>
          <Link
            to="/student/progress"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-foreground/85 transition hover:bg-primary/10 hover:text-primary"
          >
            <ScrollText className="h-4 w-4" /> View Progress
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
